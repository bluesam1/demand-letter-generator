import api from './axiosConfig';

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface TemplateContent {
  sections: TemplateSection[];
  variables?: string[];
}

export interface Template {
  id: string;
  firmId: string;
  templateName: string;
  templateDescription: string | null;
  templateContent: TemplateContent;
  category: string | null;
  createdById: string;
  version: number;
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  templateName: string;
  templateDescription?: string;
  templateContent: TemplateContent;
  category?: string;
  isDefault?: boolean;
}

export interface UpdateTemplateRequest {
  templateName?: string;
  templateDescription?: string;
  templateContent?: TemplateContent;
  category?: string;
  isDefault?: boolean;
}

export const templatesApi = {
  // Get all templates for the firm
  getAll: async (): Promise<Template[]> => {
    const response = await api.get('/templates');
    return response.data.templates;
  },

  // Get a single template by ID
  getById: async (id: string): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return response.data.template;
  },

  // Create a new template
  create: async (data: CreateTemplateRequest): Promise<Template> => {
    const response = await api.post('/templates', data);
    return response.data.template;
  },

  // Update an existing template
  update: async (id: string, data: UpdateTemplateRequest): Promise<Template> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data.template;
  },

  // Delete a template (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  // Duplicate a template
  duplicate: async (id: string): Promise<Template> => {
    const response = await api.post(`/templates/${id}/duplicate`);
    return response.data.template;
  },

  // Set a template as the firm's default
  setDefault: async (id: string): Promise<Template> => {
    const response = await api.put(`/templates/${id}/default`);
    return response.data.template;
  },
};

// Available variables for templates
export const AVAILABLE_VARIABLES = {
  client_name: 'Client full name',
  client_address: 'Client address',
  client_phone: 'Client phone number',
  client_email: 'Client email address',
  defendant_name: 'Defendant full name',
  defendant_address: 'Defendant address',
  incident_date: 'Date of incident',
  incident_location: 'Location of incident',
  demand_amount: 'Demand amount',
  demand_deadline: 'Deadline for response',
  firm_name: 'Law firm name',
  firm_address: 'Law firm address',
  firm_phone: 'Law firm phone number',
  attorney_name: 'Attorney name',
  attorney_title: 'Attorney title',
  attorney_bar_number: 'Attorney bar number',
  case_reference: 'Case reference number',
  case_type: 'Type of case',
};

// Template categories
export const TEMPLATE_CATEGORIES = [
  'Personal Injury',
  'Slip and Fall',
  'Automobile Accident',
  'Contract Dispute',
  'Property Damage',
  'Medical Malpractice',
  'Other',
];
