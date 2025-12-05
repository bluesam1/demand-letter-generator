import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Text Extraction Service
 * Extracts text from uploaded documents (PDF, Word, plain text)
 */

export class TextExtractionService {
  /**
   * Extract text from a file based on its type
   */
  async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);

      switch (mimeType) {
        case 'application/pdf':
          return await this.extractFromPdf(buffer);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.extractFromWord(buffer);

        case 'text/plain':
          return buffer.toString('utf-8');

        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractFromPdf(buffer: Buffer): Promise<string> {
    // Dynamic import for pdf-parse v2.x (ESM module)
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  /**
   * Extract text from Word document
   */
  private async extractFromWord(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Validate that extracted text meets minimum quality requirements
   */
  validateTextQuality(text: string): boolean {
    // Must have at least 100 characters to be considered valid
    return text.trim().length >= 100;
  }
}

export const textExtractionService = new TextExtractionService();
