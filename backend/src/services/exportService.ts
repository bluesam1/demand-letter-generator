import { Document, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ExportOptions {
  includeLetterhead?: boolean;
  firmName?: string;
  firmAddress?: string;
  firmPhone?: string;
  firmEmail?: string;
  attorneyName?: string;
  attorneyTitle?: string;
}

export interface LetterData {
  clientName: string;
  defendantName: string;
  caseReference?: string;
  incidentDate?: Date;
  demandAmount?: number;
  content: string;
  createdAt: Date;
}

/**
 * Export Service - Generates Word documents from demand letters
 */
export class ExportService {
  private readonly exportsDir: string;

  constructor(exportsDir: string = path.join(process.cwd(), 'exports')) {
    this.exportsDir = exportsDir;
  }

  /**
   * Ensures the exports directory exists
   */
  private async ensureExportsDirectory(): Promise<void> {
    try {
      await fs.access(this.exportsDir);
    } catch {
      await fs.mkdir(this.exportsDir, { recursive: true });
    }
  }

  /**
   * Converts HTML content to Word paragraphs
   * Simplified version - handles basic formatting
   */
  private parseContentToParagraphs(content: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Strip HTML tags and split by newlines/paragraphs
    const cleanContent = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div>/gi, '');

    // Split into lines
    const lines = cleanContent.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const textRuns: TextRun[] = [];

      // Handle bold text
      const boldRegex = /<strong>(.*?)<\/strong>|<b>(.*?)<\/b>/gi;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
          const normalText = line.substring(lastIndex, match.index).replace(/<[^>]*>/g, '');
          if (normalText) {
            textRuns.push(new TextRun({ text: normalText }));
          }
        }

        // Add bold text
        const boldText = (match[1] || match[2]).replace(/<[^>]*>/g, '');
        textRuns.push(new TextRun({ text: boldText, bold: true }));
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        const remainingText = line.substring(lastIndex).replace(/<[^>]*>/g, '');
        if (remainingText.trim()) {
          textRuns.push(new TextRun({ text: remainingText }));
        }
      }

      // If no formatting found, just add plain text
      if (textRuns.length === 0) {
        const plainText = line.replace(/<[^>]*>/g, '').trim();
        if (plainText) {
          textRuns.push(new TextRun({ text: plainText }));
        }
      }

      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: {
              after: 200,
            },
          })
        );
      }
    }

    return paragraphs;
  }

  /**
   * Creates letterhead section
   */
  private createLetterhead(options: ExportOptions): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (options.firmName) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: options.firmName,
              bold: true,
              size: 28,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    if (options.firmAddress) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: options.firmAddress,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
        })
      );
    }

    if (options.firmPhone || options.firmEmail) {
      const contactParts: string[] = [];
      if (options.firmPhone) contactParts.push(`Phone: ${options.firmPhone}`);
      if (options.firmEmail) contactParts.push(`Email: ${options.firmEmail}`);

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join(' | '),
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    return paragraphs;
  }

  /**
   * Creates date and reference section
   */
  private createDateAndReference(letterData: LetterData): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const date = letterData.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${date}`,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    if (letterData.caseReference) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Re: ${letterData.caseReference}`,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${letterData.clientName} v. ${letterData.defendantName}`,
            bold: true,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    return paragraphs;
  }

  /**
   * Creates signature block
   */
  private createSignatureBlock(options: ExportOptions): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Respectfully submitted,',
          }),
        ],
        spacing: { before: 400, after: 600 },
      })
    );

    if (options.attorneyName) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: options.attorneyName,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    }

    if (options.attorneyTitle) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: options.attorneyTitle,
            }),
          ],
        })
      );
    }

    return paragraphs;
  }

  /**
   * Generates a Word document for a demand letter
   */
  async generateWordDocument(
    letterData: LetterData,
    options: ExportOptions = {}
  ): Promise<{ filePath: string; fileName: string; fileSize: number }> {
    await this.ensureExportsDirectory();

    // Build document sections
    const sections: Paragraph[] = [];

    // Add letterhead if requested
    if (options.includeLetterhead) {
      sections.push(...this.createLetterhead(options));
    }

    // Add date and reference
    sections.push(...this.createDateAndReference(letterData));

    // Add main content
    sections.push(...this.parseContentToParagraphs(letterData.content));

    // Add signature block
    sections.push(...this.createSignatureBlock(options));

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedClientName = letterData.clientName.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
    const fileName = `${sanitizedClientName}-DemandLetter-${timestamp}.docx`;
    const filePath = path.join(this.exportsDir, fileName);

    // Generate and save document
    const { Packer } = await import('docx');
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(filePath, buffer);

    // Get file size
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    return {
      filePath,
      fileName,
      fileSize,
    };
  }

  /**
   * Deletes an exported file
   */
  async deleteExport(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete export file:', error);
    }
  }

  /**
   * Checks if an export file exists
   */
  async exportExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const exportService = new ExportService();
