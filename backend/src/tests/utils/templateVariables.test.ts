import { describe, it, expect } from 'vitest';
import {
  extractVariables,
  validateVariables,
  substituteVariables,
  validateTemplateStructure,
  createDefaultSections,
  TemplateContent,
} from '../../utils/templateVariables.js';

describe('Template Variables Utility', () => {
  describe('extractVariables', () => {
    it('should extract variables from template content', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Introduction',
            content: '<p>Dear {{defendant_name}},</p><p>This is regarding {{client_name}}.</p>',
            order: 1,
          },
          {
            id: '2',
            title: 'Facts',
            content: '<p>On {{incident_date}}, at {{incident_location}}...</p>',
            order: 2,
          },
        ],
      };

      const variables = extractVariables(content);

      expect(variables).toContain('defendant_name');
      expect(variables).toContain('client_name');
      expect(variables).toContain('incident_date');
      expect(variables).toContain('incident_location');
      expect(variables).toHaveLength(4);
    });

    it('should not duplicate variables', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: '{{client_name}} and {{client_name}}',
            order: 1,
          },
        ],
      };

      const variables = extractVariables(content);

      expect(variables).toHaveLength(1);
      expect(variables[0]).toBe('client_name');
    });

    it('should return empty array when no variables', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: '<p>No variables here</p>',
            order: 1,
          },
        ],
      };

      const variables = extractVariables(content);

      expect(variables).toHaveLength(0);
    });
  });

  describe('validateVariables', () => {
    it('should identify valid variables', () => {
      const variables = ['client_name', 'defendant_name', 'incident_date'];
      const result = validateVariables(variables);

      expect(result.valid).toContain('client_name');
      expect(result.valid).toContain('defendant_name');
      expect(result.valid).toContain('incident_date');
      expect(result.invalid).toHaveLength(0);
    });

    it('should identify invalid variables', () => {
      const variables = ['client_name', 'invalid_var', 'another_invalid'];
      const result = validateVariables(variables);

      expect(result.valid).toContain('client_name');
      expect(result.invalid).toContain('invalid_var');
      expect(result.invalid).toContain('another_invalid');
    });

    it('should handle all invalid variables', () => {
      const variables = ['foo', 'bar', 'baz'];
      const result = validateVariables(variables);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(3);
    });
  });

  describe('substituteVariables', () => {
    it('should substitute variables with provided values', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Introduction',
            content: '<p>Dear {{defendant_name}}, regarding {{client_name}}.</p>',
            order: 1,
          },
        ],
      };

      const values = {
        defendant_name: 'John Doe',
        client_name: 'Jane Smith',
      };

      const result = substituteVariables(content, values);

      expect(result.sections[0].content).toContain('Dear John Doe');
      expect(result.sections[0].content).toContain('regarding Jane Smith');
    });

    it('should keep variable placeholders when value not provided', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Section',
            content: 'Client: {{client_name}}, Amount: {{demand_amount}}',
            order: 1,
          },
        ],
      };

      const values = {
        client_name: 'Jane Smith',
      };

      const result = substituteVariables(content, values);

      expect(result.sections[0].content).toContain('Jane Smith');
      expect(result.sections[0].content).toContain('{{demand_amount}}');
    });

    it('should handle empty values object', () => {
      const content: TemplateContent = {
        sections: [
          {
            id: '1',
            title: 'Section',
            content: 'Dear {{defendant_name}}',
            order: 1,
          },
        ],
      };

      const result = substituteVariables(content, {});

      expect(result.sections[0].content).toBe('Dear {{defendant_name}}');
    });
  });

  describe('validateTemplateStructure', () => {
    it('should validate correct template structure', () => {
      const content = {
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: 'Content',
            order: 1,
          },
        ],
      };

      const result = validateTemplateStructure(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object content', () => {
      const result = validateTemplateStructure('invalid');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must be an object');
    });

    it('should reject content without sections array', () => {
      const result = validateTemplateStructure({ foo: 'bar' });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must have a sections array');
    });

    it('should reject empty sections array', () => {
      const result = validateTemplateStructure({ sections: [] });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least one section');
    });

    it('should identify section missing id', () => {
      const content = {
        sections: [
          {
            title: 'Section 1',
            content: 'Content',
            order: 1,
          },
        ],
      };

      const result = validateTemplateStructure(content);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing an id');
    });

    it('should identify section missing title', () => {
      const content = {
        sections: [
          {
            id: '1',
            content: 'Content',
            order: 1,
          },
        ],
      };

      const result = validateTemplateStructure(content);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing a title');
    });

    it('should identify section missing content', () => {
      const content = {
        sections: [
          {
            id: '1',
            title: 'Section 1',
            order: 1,
          },
        ],
      };

      const result = validateTemplateStructure(content);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing content');
    });

    it('should identify section missing order', () => {
      const content = {
        sections: [
          {
            id: '1',
            title: 'Section 1',
            content: 'Content',
          },
        ],
      };

      const result = validateTemplateStructure(content);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing a valid order number');
    });
  });

  describe('createDefaultSections', () => {
    it('should create default sections', () => {
      const sections = createDefaultSections();

      expect(sections).toHaveLength(6);
      expect(sections[0].title).toBe('Introduction/Letterhead');
      expect(sections[1].title).toBe('Statement of Facts');
      expect(sections[2].title).toBe('Legal Liability Analysis');
      expect(sections[3].title).toBe('Damages Calculation');
      expect(sections[4].title).toBe('Demand and Settlement Terms');
      expect(sections[5].title).toBe('Closing/Signature Block');
    });

    it('should have proper ordering', () => {
      const sections = createDefaultSections();

      sections.forEach((section, index) => {
        expect(section.order).toBe(index + 1);
      });
    });

    it('should include variables in content', () => {
      const sections = createDefaultSections();

      const allContent = sections.map(s => s.content).join(' ');
      expect(allContent).toContain('{{defendant_name}}');
      expect(allContent).toContain('{{client_name}}');
      expect(allContent).toContain('{{incident_date}}');
      expect(allContent).toContain('{{demand_amount}}');
    });
  });
});
