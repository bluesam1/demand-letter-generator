import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PageLayout } from '../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { fetchTemplates, deleteTemplate, duplicateTemplate, setDefaultTemplate } from '../store/templatesSlice';
import { RootState, AppDispatch } from '../store';
import { Template } from '../api/templatesApi';

export default function Templates() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading, error } = useSelector((state: RootState) => state.templates);
  const [filter, setFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleCreateTemplate = () => {
    navigate('/templates/new');
  };

  const handleEditTemplate = (id: string) => {
    navigate(`/templates/${id}/edit`);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await dispatch(deleteTemplate(id));
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    await dispatch(duplicateTemplate(id));
  };

  const handleSetDefault = async (id: string) => {
    await dispatch(setDefaultTemplate(id));
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.templateName.toLowerCase().includes(filter.toLowerCase()) ||
      template.templateDescription?.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(templates.map(t => t.category).filter(Boolean))];

  return (
    <PageLayout title="Templates">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">
              Manage and organize your demand letter templates
            </p>
          </div>
          <Button onClick={handleCreateTemplate}>New Template</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search templates..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat || ''}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                {filter || selectedCategory !== 'all'
                  ? 'No templates match your search criteria.'
                  : 'No templates yet. Create your first template to get started.'}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

interface TemplateCardProps {
  template: Template;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onSetDefault: (id: string) => void;
}

function TemplateCard({ template, onEdit, onDelete, onDuplicate, onSetDefault }: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {template.templateName}
              {template.isDefault && (
                <span className="ml-2 inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                  Default
                </span>
              )}
            </CardTitle>
            {template.category && (
              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                {template.category}
              </span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={() => {
                    onEdit(template.id);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate(template.id);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Duplicate
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => {
                      onSetDefault(template.id);
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(template.id, template.templateName);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.templateDescription || 'No description'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Version {template.version}</span>
          <span>{template.usageCount} uses</span>
          <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
