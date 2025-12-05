import axios from 'axios';

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt for legal demand letter generation
const SYSTEM_PROMPT = `You are an expert legal document assistant specializing in demand letters.
Your role is to generate professional, persuasive demand letters based on provided
case information and source documents.

Key principles:
1. Use clear, professional legal language
2. Organize content logically (introduction, facts, liability, damages, demand)
3. Base all arguments on the provided source documents
4. Maintain objective tone while being persuasive
5. Calculate reasonable damages based on evidence
6. Follow standard demand letter format
7. Include appropriate legal disclaimers

CRITICAL - Amount Extraction and Placeholder Replacement:
- Carefully analyze the source documents to extract all monetary amounts (medical bills, repair costs, lost wages, etc.)
- If a template is provided with $[AMOUNT] placeholders, you MUST replace each placeholder with actual dollar amounts extracted from or calculated based on the source documents
- When specific amounts are found in source documents, use those exact figures
- When amounts need to be calculated (e.g., pain and suffering, future damages), provide reasonable estimates based on the evidence and clearly note they are calculated
- NEVER leave $[AMOUNT] or similar placeholders in the final output - every amount must be filled in
- Format all monetary values consistently (e.g., $1,234.56)
- Itemize damages clearly with subtotals and a grand total

Output format:
- Clear section headers
- Professional font-ready formatting
- ALL placeholder variables replaced with actual values - no placeholders in final output
- Word count 800-2000 words

Generate a complete, professional demand letter that can be used immediately after review.`;

interface LetterData {
  clientName: string;
  defendantName: string;
  incidentDate: string | null;
  demandAmount: number | null;
  caseReference?: string | null;
  injuries?: string;
  damages?: string;
}

interface GenerationResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

class AIService {
  private apiKey: string | null = null;
  private model: string = 'anthropic/claude-3.5-sonnet';
  private maxTokens: number = 4096;
  private temperature: number = 0.3;

  constructor() {
    // Defer API key validation to first use
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey && apiKey !== 'your-openrouter-api-key-here') {
      this.apiKey = apiKey;
    }
  }

  private ensureApiKey(): string {
    if (!this.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY is not configured. Please set a valid API key in environment variables.'
      );
    }
    return this.apiKey;
  }

  /**
   * Build the user prompt for letter generation
   */
  private buildPrompt(letterData: LetterData, sourceTexts: string[], templateContent?: string): string {
    const incidentDateStr = letterData.incidentDate
      ? new Date(letterData.incidentDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Not specified';

    const demandAmountStr = letterData.demandAmount
      ? `$${Number(letterData.demandAmount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'To be determined';

    let prompt = `Generate a professional demand letter with the following information:

CASE INFORMATION:
- Client Name: ${letterData.clientName}
- Defendant Name: ${letterData.defendantName}
- Incident Date: ${incidentDateStr}
- Case Reference: ${letterData.caseReference || 'Not specified'}
- Demand Amount: ${demandAmountStr}`;

    if (letterData.injuries) {
      prompt += `
- Injuries Sustained: ${letterData.injuries}`;
    }

    if (letterData.damages) {
      prompt += `
- Damages Description: ${letterData.damages}`;
    }

    if (sourceTexts && sourceTexts.length > 0) {
      prompt += `

SOURCE DOCUMENTS CONTENT:
The following documents provide evidence and details about the case:

${sourceTexts
  .map(
    (text, index) => `--- Document ${index + 1} ---
${text.substring(0, 5000)}${text.length > 5000 ? '\n[Document truncated for length]' : ''}
`
  )
  .join('\n')}`;
    }

    if (templateContent) {
      prompt += `

TEMPLATE STRUCTURE:
Use the following template as a structural guide. IMPORTANT: Replace ALL $[AMOUNT] placeholders with actual dollar amounts based on the source documents above. Extract specific amounts where available, or calculate reasonable estimates where needed.

${templateContent}
`;
    }

    prompt += `

REQUIREMENTS:
1. Professional legal tone and language
2. Clear section structure with the following sections:
   - Opening paragraph (introduce attorney/law firm and purpose)
   - Statement of Facts (what happened, when, where, parties involved)
   - Legal Liability Analysis (why defendant is liable)
   - Damages and Injuries (itemize losses, medical expenses, pain and suffering)
   - Demand for Settlement (specific amount and payment terms)
   - Closing (deadline for response, consequences of non-compliance)
3. Persuasive but factual language based on provided documents
4. Appropriate demand amount justified by damages
5. Standard demand letter format suitable for legal correspondence
6. Include date placeholder [DATE] at the top
7. Include signature line placeholder at the bottom

Generate the complete demand letter now:`;

    return prompt;
  }

  /**
   * Validate generated content meets quality standards
   */
  private validateContent(content: string): { valid: boolean; error?: string } {
    // Minimum length check
    if (content.length < 500) {
      return { valid: false, error: 'Generated content too short (< 500 characters)' };
    }

    // Maximum length check
    if (content.length > 15000) {
      return { valid: false, error: 'Generated content too long (> 15,000 characters)' };
    }

    // Check for key sections (at least some should be present)
    const hasFactsSection =
      content.toLowerCase().includes('fact') || content.toLowerCase().includes('incident');
    const hasLiabilitySection =
      content.toLowerCase().includes('liabilit') || content.toLowerCase().includes('responsible');
    const hasDamagesSection =
      content.toLowerCase().includes('damage') || content.toLowerCase().includes('injur');
    const hasDemandSection =
      content.toLowerCase().includes('demand') || content.toLowerCase().includes('settlement');

    const sectionsPresent = [hasFactsSection, hasLiabilitySection, hasDamagesSection, hasDemandSection].filter(
      Boolean
    ).length;

    if (sectionsPresent < 2) {
      return { valid: false, error: 'Generated content missing key sections' };
    }

    // Check for obvious gibberish (too many repeated characters)
    const repeatedCharsMatch = content.match(/(.)\1{10,}/);
    if (repeatedCharsMatch) {
      return { valid: false, error: 'Generated content contains gibberish' };
    }

    return { valid: true };
  }

  /**
   * Generate a demand letter using OpenRouter API (Claude via OpenRouter)
   */
  async generateLetter(
    letterData: LetterData,
    sourceTexts: string[],
    templateContent?: string
  ): Promise<GenerationResult> {
    const apiKey = this.ensureApiKey();

    try {
      // Build the prompt
      const userPrompt = this.buildPrompt(letterData, sourceTexts, templateContent);

      // Call OpenRouter API
      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_API_URL,
        {
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:5174',
            'X-Title': 'Steno Demand Letter Generator',
          },
          timeout: 120000, // 2 minute timeout for long generations
        }
      );

      // Extract content from response
      const content = response.data.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('No content generated from AI model');
      }

      // Validate content
      const validation = this.validateContent(content);
      if (!validation.valid) {
        throw new Error(`Content validation failed: ${validation.error}`);
      }

      // Return result with token usage
      return {
        content,
        inputTokens: response.data.usage?.prompt_tokens || 0,
        outputTokens: response.data.usage?.completion_tokens || 0,
        model: response.data.model || this.model,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`AI API Error (${status || 'unknown'}): ${message}`);
      }
      throw error;
    }
  }

  /**
   * Calculate cost of generation based on token usage
   * Note: OpenRouter pricing varies by model, these are approximate for Claude 3.5 Sonnet
   */
  calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Sonnet pricing via OpenRouter (approximate)
    const INPUT_COST_PER_MILLION = 3.0; // $3 per million input tokens
    const OUTPUT_COST_PER_MILLION = 15.0; // $15 per million output tokens

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

    return inputCost + outputCost;
  }
}

// Export singleton instance
export const aiService = new AIService();
