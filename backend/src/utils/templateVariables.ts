/**
 * Template variable extraction and validation utilities
 */

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface TemplateContent {
  sections: TemplateSection[];
}

// Predefined template variables that can be used
export const AVAILABLE_VARIABLES = {
  // Client information
  client_name: 'Client full name',
  client_address: 'Client address',
  client_phone: 'Client phone number',
  client_email: 'Client email address',

  // Defendant information
  defendant_name: 'Defendant full name',
  defendant_address: 'Defendant address',

  // Incident information
  incident_date: 'Date of incident',
  incident_location: 'Location of incident',

  // Demand information
  demand_amount: 'Demand amount',
  demand_deadline: 'Deadline for response',

  // Firm information
  firm_name: 'Law firm name',
  firm_address: 'Law firm address',
  firm_phone: 'Law firm phone number',

  // Attorney information
  attorney_name: 'Attorney name',
  attorney_title: 'Attorney title',
  attorney_bar_number: 'Attorney bar number',

  // Case information
  case_reference: 'Case reference number',
  case_type: 'Type of case',
};

/**
 * Extract all variables from template content
 * Variables are in the format {{variable_name}}
 */
export function extractVariables(content: TemplateContent): string[] {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();

  const contentString = JSON.stringify(content);
  let match;

  while ((match = variablePattern.exec(contentString)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Validate that all variables in the template are recognized
 */
export function validateVariables(variables: string[]): {
  valid: string[];
  invalid: string[];
} {
  const validVariables: string[] = [];
  const invalidVariables: string[] = [];

  for (const variable of variables) {
    if (variable in AVAILABLE_VARIABLES) {
      validVariables.push(variable);
    } else {
      invalidVariables.push(variable);
    }
  }

  return { valid: validVariables, invalid: invalidVariables };
}

/**
 * Substitute variables in template content with provided values
 */
export function substituteVariables(
  content: TemplateContent,
  values: Record<string, string>
): TemplateContent {
  const contentString = JSON.stringify(content);

  let substituted = contentString;
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    substituted = substituted.replace(pattern, value || `{{${key}}}`);
  }

  return JSON.parse(substituted);
}

/**
 * Validate template structure
 */
export function validateTemplateStructure(content: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content || typeof content !== 'object') {
    errors.push('Template content must be an object');
    return { valid: false, errors };
  }

  const contentObj = content as Record<string, unknown>;
  if (!Array.isArray(contentObj.sections)) {
    errors.push('Template must have a sections array');
    return { valid: false, errors };
  }

  if (contentObj.sections.length === 0) {
    errors.push('Template must have at least one section');
  }

  contentObj.sections.forEach((section: TemplateSection, index: number) => {
    if (!section.id) {
      errors.push(`Section ${index + 1} is missing an id`);
    }
    if (!section.title) {
      errors.push(`Section ${index + 1} is missing a title`);
    }
    if (section.content === undefined) {
      errors.push(`Section ${index + 1} is missing content`);
    }
    if (typeof section.order !== 'number') {
      errors.push(`Section ${index + 1} is missing a valid order number`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create default template sections
 */
export function createDefaultSections(): TemplateSection[] {
  return [
    {
      id: 'intro',
      title: 'Introduction/Letterhead',
      content: '<p>Dear {{defendant_name}},</p><p>This letter is written on behalf of our client, {{client_name}}, regarding the incident that occurred on {{incident_date}}.</p>',
      order: 1,
    },
    {
      id: 'facts',
      title: 'Statement of Facts',
      content: '<p>On {{incident_date}}, at {{incident_location}}, the following events occurred:</p><p>[Details of the incident]</p>',
      order: 2,
    },
    {
      id: 'liability',
      title: 'Legal Liability Analysis',
      content: '<p>Based on the facts presented, {{defendant_name}} is liable for the following reasons:</p><p>[Legal analysis]</p>',
      order: 3,
    },
    {
      id: 'damages',
      title: 'Damages Calculation',
      content: '<p>Our client has suffered the following damages:</p><p>[Itemized damages]</p><p><strong>Total Demand: {{demand_amount}}</strong></p>',
      order: 4,
    },
    {
      id: 'demand',
      title: 'Demand and Settlement Terms',
      content: '<p>We demand payment of {{demand_amount}} to settle this matter. This offer is valid until {{demand_deadline}}.</p>',
      order: 5,
    },
    {
      id: 'closing',
      title: 'Closing/Signature Block',
      content: '<p>Sincerely,</p><p>{{attorney_name}}<br/>{{attorney_title}}<br/>{{firm_name}}<br/>{{firm_address}}<br/>{{firm_phone}}</p>',
      order: 6,
    },
  ];
}
