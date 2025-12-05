import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageLayout } from '../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { createTemplate, updateTemplate, fetchTemplateById, clearCurrentTemplate } from '../store/templatesSlice';
import { RootState, AppDispatch } from '../store';
import {
  TemplateContent,
  TemplateSection,
  AVAILABLE_VARIABLES,
  TEMPLATE_CATEGORIES,
} from '../api/templatesApi';

const generateSectionId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultSection: TemplateSection = {
  id: generateSectionId(),
  title: 'Introduction',
  content: '',
  order: 0,
};

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentTemplate, loading, error } = useSelector((state: RootState) => state.templates);

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>([{ ...defaultSection }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load template data for editing
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchTemplateById(id));
    }
    return () => {
      dispatch(clearCurrentTemplate());
    };
  }, [dispatch, id, isEditing]);

  // Populate form with template data
  useEffect(() => {
    if (currentTemplate && isEditing) {
      setTemplateName(currentTemplate.templateName);
      setTemplateDescription(currentTemplate.templateDescription || '');
      setCategory(currentTemplate.category || '');
      setIsDefault(currentTemplate.isDefault);
      if (currentTemplate.templateContent?.sections?.length > 0) {
        setSections(currentTemplate.templateContent.sections);
      }
    }
  }, [currentTemplate, isEditing]);

  const handleAddSection = () => {
    const newSection: TemplateSection = {
      id: generateSectionId(),
      title: '',
      content: '',
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    const newSections = sections.filter((_, i) => i !== index);
    // Re-order sections
    newSections.forEach((s, i) => (s.order = i));
    setSections(newSections);
  };

  const handleSectionChange = (index: number, field: keyof TemplateSection, value: string | number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    // Update order numbers
    newSections.forEach((s, i) => (s.order = i));
    setSections(newSections);
  };

  const insertVariable = (sectionIndex: number, variable: string) => {
    const section = sections[sectionIndex];
    const newContent = section.content + `{{${variable}}}`;
    handleSectionChange(sectionIndex, 'content', newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!templateName.trim()) {
      setFormError('Template name is required');
      return;
    }

    if (sections.every((s) => !s.content.trim())) {
      setFormError('At least one section must have content');
      return;
    }

    setSaving(true);

    try {
      const templateContent: TemplateContent = {
        sections: sections.map((s, i) => ({
          ...s,
          order: i,
        })),
        variables: Object.keys(AVAILABLE_VARIABLES),
      };

      if (isEditing && id) {
        await dispatch(
          updateTemplate({
            id,
            data: {
              templateName: templateName.trim(),
              templateDescription: templateDescription.trim() || undefined,
              templateContent,
              category: category || undefined,
              isDefault,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createTemplate({
            templateName: templateName.trim(),
            templateDescription: templateDescription.trim() || undefined,
            templateContent,
            category: category || undefined,
            isDefault,
          })
        ).unwrap();
      }

      navigate('/templates');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEditing ? 'Edit Template' : 'Create Template'}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? 'Modify your demand letter template'
              : 'Create a reusable demand letter template'}
          </p>
        </div>

        {(error || formError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Personal Injury Demand Letter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of when to use this template"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set as default template</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Variables Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Click on a variable to copy it, then paste into a section. Variables will be
                replaced with actual values when generating letters.
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AVAILABLE_VARIABLES).map(([key, description]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(`{{${key}}}`)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300"
                    title={description}
                  >
                    {`{{${key}}}`}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Sections */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Template Sections</CardTitle>
                <Button type="button" onClick={handleAddSection}>
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Section {index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remove section"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      placeholder="e.g., Statement of Facts"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Content
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              insertVariable(index, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Insert variable...</option>
                          {Object.entries(AVAILABLE_VARIABLES).map(([key, description]) => (
                            <option key={key} value={key}>
                              {key} - {description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                      placeholder="Enter section content. Use {{variable_name}} for dynamic content."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => navigate('/templates')}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
