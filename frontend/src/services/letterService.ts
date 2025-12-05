import api from '../api/axiosConfig';

export interface Letter {
  id: string;
  clientName: string;
  defendantName: string;
  caseReference?: string;
  incidentDate?: string;
  demandAmount?: number;
  status: string;
  content?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  sourceDocuments?: SourceDocument[];
  template?: Template;
}

export interface SourceDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  processingStatus: string;
  uploadedAt: string;
}

export interface Template {
  id: string;
  templateName: string;
  templateDescription?: string;
  templateContent: Record<string, unknown>;
}

export interface CreateLetterData {
  clientName: string;
  defendantName: string;
  caseReference?: string;
  incidentDate?: string;
  demandAmount?: number;
  templateId?: string;
  injuries?: string;
  damages?: string;
}

export interface GenerationResult {
  letter: Letter;
  generation: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    model: string;
    processingTimeMs: number;
    estimatedCost: number;
  };
}

export interface DashboardStats {
  total: number;
  draft: number;
  generated: number;
  finalized: number;
  exported: number;
}

export interface LetterListParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface LetterListResponse {
  letters: Letter[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ExportData {
  id: string;
  fileName: string;
  format: string;
  fileSize: number;
  exportedAt: string;
  exportedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ExportResponse {
  export: {
    id: string;
    fileName: string;
    fileSize: number;
    format: string;
    exportedAt: string;
  };
}

export const letterService = {
  // Get dashboard stats
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get all letters for the firm with filtering, sorting, pagination
  async getAll(params?: LetterListParams): Promise<LetterListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/letters?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single letter by ID
  async getById(id: string): Promise<{ letter: Letter }> {
    const response = await api.get(`/letters/${id}`);
    return response.data;
  },

  // Create a new letter
  async create(data: CreateLetterData): Promise<{ letter: Letter }> {
    const response = await api.post('/letters', data);
    return response.data;
  },

  // Update a letter
  async update(id: string, data: Partial<CreateLetterData> & { content?: string }): Promise<{ letter: Letter }> {
    const response = await api.put(`/letters/${id}`, data);
    return response.data;
  },

  // Delete a letter
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/letters/${id}`);
    return response.data;
  },

  // Generate letter content using AI
  async generate(id: string): Promise<GenerationResult> {
    const response = await api.post(`/letters/${id}/generate`);
    return response.data;
  },

  // Export letter to Word format
  async exportLetter(id: string, includeLetterhead = true): Promise<ExportResponse> {
    const response = await api.post(`/letters/${id}/export`, { includeLetterhead });
    return response.data;
  },

  // Get all exports for a letter
  async getExports(id: string): Promise<{ exports: ExportData[] }> {
    const response = await api.get(`/letters/${id}/exports`);
    return response.data;
  },

  // Download an export file
  async downloadExport(exportId: string): Promise<Blob> {
    const response = await api.get(`/exports/${exportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete an export
  async deleteExport(exportId: string): Promise<{ message: string }> {
    const response = await api.delete(`/exports/${exportId}`);
    return response.data;
  },
};
