import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { letterService, Letter } from '../services/letterService';
import { RichTextEditor } from '../components/editor';
import ExportDialog from '../components/ExportDialog';
import ExportHistory from '../components/ExportHistory';

const LetterView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportRefreshTrigger, setExportRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLetter(id);
    }
  }, [id]);

  const fetchLetter = async (letterId: string) => {
    try {
      setLoading(true);
      const result = await letterService.getById(letterId);
      setLetter(result.letter);
      setEditedContent(result.letter.content || '');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string | object; message?: string } }; message?: string };
      let errorMessage = 'Failed to load letter';
      if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string'
          ? error.response.data.error
          : error.response.data.message || 'Failed to load letter';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (content: string) => {
    setEditedContent(content);
  };

  const handleAutoSave = async (content: string) => {
    if (!id) return;

    setError(null);

    try {
      await letterService.update(id, { content });
      setLetter((prev) => (prev ? { ...prev, content } : null));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string | object; message?: string } }; message?: string };
      let errorMessage = 'Failed to save letter';
      if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string'
          ? error.response.data.error
          : error.response.data.message || 'Failed to save letter';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      throw err;
    }
  };

  const handleRegenerate = async () => {
    if (!id || !window.confirm('Are you sure you want to regenerate this letter? Current content will be replaced.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await letterService.generate(id);
      setLetter(result.letter);
      setEditedContent(result.letter.content || '');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string | object; message?: string } }; message?: string };
      let errorMessage = 'Failed to regenerate letter';
      if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string'
          ? error.response.data.error
          : error.response.data.message || 'Failed to regenerate letter';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading letter...</p>
        </div>
      </div>
    );
  }

  if (error && !letter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Error Loading Letter</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => navigate('/letters')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Letters
          </button>
        </div>
      </div>
    );
  }

  if (!letter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/letters')}
              className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Letters
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {letter.clientName} v. {letter.defendantName}
            </h1>
            <p className="text-gray-600">
              Case Reference: {letter.caseReference || 'N/A'} | Status: {letter.status}
            </p>
          </div>

          <div className="flex space-x-3">
            {letter.content && (
              <button
                onClick={() => setIsExportDialogOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </button>
            )}
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Regenerate
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Letter Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">Client Name</dt>
              <dd className="text-sm font-medium text-gray-900">{letter.clientName}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Defendant Name</dt>
              <dd className="text-sm font-medium text-gray-900">{letter.defendantName}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Incident Date</dt>
              <dd className="text-sm font-medium text-gray-900">
                {letter.incidentDate ? new Date(letter.incidentDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Demand Amount</dt>
              <dd className="text-sm font-medium text-gray-900">
                {letter.demandAmount
                  ? `$${Number(letter.demandAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Created</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(letter.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Last Updated</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(letter.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Source Documents */}
        {letter.sourceDocuments && letter.sourceDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Documents</h2>
            <div className="space-y-2">
              {letter.sourceDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Status: {doc.processingStatus} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export History */}
        {letter.content && (
          <div className="mb-6">
            <ExportHistory letterId={id!} refreshTrigger={exportRefreshTrigger} />
          </div>
        )}

        {/* Letter Content */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Letter Content</h2>

          {!letter.content ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No content generated yet</p>
              <button
                onClick={handleRegenerate}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Letter
              </button>
            </div>
          ) : (
            <RichTextEditor
              content={editedContent}
              onChange={handleContentChange}
              onSave={handleAutoSave}
              autoSaveInterval={30000}
              readOnly={letter.status === 'Finalized'}
            />
          )}
        </div>

        {/* Export Dialog */}
        <ExportDialog
          letterId={id!}
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          onExportComplete={() => {
            setExportRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    </div>
  );
};

export default LetterView;
