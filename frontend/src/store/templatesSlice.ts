import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { templatesApi, Template, CreateTemplateRequest, UpdateTemplateRequest } from '../api/templatesApi';

interface TemplatesState {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async () => {
    const templates = await templatesApi.getAll();
    return templates;
  }
);

export const fetchTemplateById = createAsyncThunk(
  'templates/fetchById',
  async (id: string) => {
    const template = await templatesApi.getById(id);
    return template;
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (data: CreateTemplateRequest) => {
    const template = await templatesApi.create(data);
    return template;
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, data }: { id: string; data: UpdateTemplateRequest }) => {
    const template = await templatesApi.update(id, data);
    return template;
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id: string) => {
    await templatesApi.delete(id);
    return id;
  }
);

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicate',
  async (id: string) => {
    const template = await templatesApi.duplicate(id);
    return template;
  }
);

export const setDefaultTemplate = createAsyncThunk(
  'templates/setDefault',
  async (id: string) => {
    const template = await templatesApi.setDefault(id);
    return template;
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearCurrentTemplate(state) {
      state.currentTemplate = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all templates
    builder.addCase(fetchTemplates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      state.loading = false;
      state.templates = action.payload;
    });
    builder.addCase(fetchTemplates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch templates';
    });

    // Fetch template by ID
    builder.addCase(fetchTemplateById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTemplateById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTemplate = action.payload;
    });
    builder.addCase(fetchTemplateById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch template';
    });

    // Create template
    builder.addCase(createTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTemplate.fulfilled, (state, action) => {
      state.loading = false;
      state.templates.push(action.payload);
    });
    builder.addCase(createTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create template';
    });

    // Update template
    builder.addCase(updateTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTemplate.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.templates.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.currentTemplate?.id === action.payload.id) {
        state.currentTemplate = action.payload;
      }
    });
    builder.addCase(updateTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update template';
    });

    // Delete template
    builder.addCase(deleteTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTemplate.fulfilled, (state, action) => {
      state.loading = false;
      state.templates = state.templates.filter((t) => t.id !== action.payload);
      if (state.currentTemplate?.id === action.payload) {
        state.currentTemplate = null;
      }
    });
    builder.addCase(deleteTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete template';
    });

    // Duplicate template
    builder.addCase(duplicateTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(duplicateTemplate.fulfilled, (state, action) => {
      state.loading = false;
      state.templates.push(action.payload);
    });
    builder.addCase(duplicateTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to duplicate template';
    });

    // Set default template
    builder.addCase(setDefaultTemplate.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setDefaultTemplate.fulfilled, (state, action) => {
      state.loading = false;
      // Clear all other defaults
      state.templates = state.templates.map((t) => ({
        ...t,
        isDefault: t.id === action.payload.id,
      }));
    });
    builder.addCase(setDefaultTemplate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to set default template';
    });
  },
});

export const { clearCurrentTemplate, clearError } = templatesSlice.actions;

export default templatesSlice.reducer;
