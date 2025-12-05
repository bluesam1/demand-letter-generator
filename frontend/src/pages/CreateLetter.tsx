import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { letterService, CreateLetterData } from '../services/letterService';
import api from '../api/axiosConfig';

interface Template {
  id: string;
  templateName: string;
  templateDescription?: string;
}

const CreateLetter = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [letterId, setLetterId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateLetterData>({
    clientName: '',
    defendantName: '',
    caseReference: '',
    incidentDate: '',
    demandAmount: undefined,
    templateId: '',
    injuries: '',
    damages: '',
  });

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<{ id: string; fileName: string }[]>([]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'demandAmount' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = async () => {
    setError(null);

    if (step === 1) {
      // Validate case details
      if (!formData.clientName || !formData.defendantName) {
        setError('Client name and defendant name are required');
        return;
      }

      // Create letter
      setLoading(true);
      try {
        const result = await letterService.create(formData);
        setLetterId(result.letter.id);
        setStep(2);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Failed to create letter');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      // Upload documents
      if (selectedFiles.length === 0) {
        setError('Please upload at least one source document');
        return;
      }

      await uploadDocuments();
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const uploadDocuments = async () => {
    if (!letterId) return;

    setLoading(true);
    setError(null);

    try {
      const uploadedDocs = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('letterId', letterId);

        const response = await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedDocs.push(response.data.document);
      }

      setUploadedDocuments(uploadedDocs);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || 'Failed to upload documents';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!letterId) return;

    setLoading(true);
    setError(null);

    try {
      // Wait a moment for document processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await letterService.generate(letterId);

      // Navigate to letter view/edit page
      navigate(`/letters/${result.letter.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string | object; message?: string } }; message?: string };
      let errorMessage = 'Failed to generate letter';
      if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string'
          ? error.response.data.error
          : error.response.data.message || 'Failed to generate letter';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Demand Letter</h1>
          <p className="mt-2 text-gray-600">Follow the steps to create and generate your demand letter</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Case Details', 'Upload Documents', 'Select Template', 'Generate'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step > index + 1
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === index + 1
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
                {index < 3 && <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Enter Case Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Defendant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="defendantName"
                    value={formData.defendantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Case Reference</label>
                  <input
                    type="text"
                    name="caseReference"
                    value={formData.caseReference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date</label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Demand Amount ($)</label>
                  <input
                    type="number"
                    name="demandAmount"
                    value={formData.demandAmount || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Injuries Sustained</label>
                <textarea
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the injuries sustained by the client..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Damages Description</label>
                <textarea
                  name="damages"
                  value={formData.damages}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the damages (medical bills, lost wages, property damage, etc.)..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Upload Source Documents</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, or TXT files</p>
                  </div>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Selected Files:</h3>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
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
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 3: Select Template (Optional)</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="no-template"
                    name="templateId"
                    value=""
                    checked={!formData.templateId}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="no-template" className="ml-3 block text-sm font-medium text-gray-700">
                    No Template (Generate from scratch)
                  </label>
                </div>

                {templates.map((template) => (
                  <div key={template.id} className="flex items-start">
                    <input
                      type="radio"
                      id={`template-${template.id}`}
                      name="templateId"
                      value={template.id}
                      checked={formData.templateId === template.id}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <label htmlFor={`template-${template.id}`} className="ml-3 block">
                      <span className="text-sm font-medium text-gray-900">{template.templateName}</span>
                      {template.templateDescription && (
                        <p className="text-sm text-gray-500">{template.templateDescription}</p>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 4: Generate Letter</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">Review Summary</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Client:</dt>
                    <dd className="font-medium text-gray-900">{formData.clientName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Defendant:</dt>
                    <dd className="font-medium text-gray-900">{formData.defendantName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Source Documents:</dt>
                    <dd className="font-medium text-gray-900">{uploadedDocuments.length} uploaded</dd>
                  </div>
                  {formData.demandAmount && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Demand Amount:</dt>
                      <dd className="font-medium text-gray-900">
                        ${formData.demandAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <p className="text-sm text-gray-600">
                Click Generate to create your demand letter using AI. This process typically takes 30-90 seconds.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={step === 1 || loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Letter'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLetter;
