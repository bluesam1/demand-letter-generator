import { useState, useEffect, useCallback } from 'react';
import { letterService, ExportData } from '../services/letterService';
import { extractErrorMessage } from '../utils/errorUtils';

interface ExportHistoryProps {
  letterId: string;
  refreshTrigger?: number;
}

const ExportHistory = ({ letterId, refreshTrigger }: ExportHistoryProps) => {
  const [exports, setExports] = useState<ExportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExports = useCallback(async () => {
    try {
      setLoading(true);
      const result = await letterService.getExports(letterId);
      setExports(result.exports);
      setError(null);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to load export history'));
    } finally {
      setLoading(false);
    }
  }, [letterId]);

  useEffect(() => {
    fetchExports();
  }, [fetchExports, refreshTrigger]);

  const handleDownload = async (exportId: string, fileName: string) => {
    try {
      const blob = await letterService.downloadExport(exportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(extractErrorMessage(err, 'Failed to download export'));
    }
  };

  const handleDelete = async (exportId: string) => {
    if (!window.confirm('Are you sure you want to delete this export?')) {
      return;
    }

    try {
      await letterService.deleteExport(exportId);
      setExports(exports.filter((exp) => exp.id !== exportId));
    } catch (err: unknown) {
      alert(extractErrorMessage(err, 'Failed to delete export'));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading exports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Export History</h2>

      {exports.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No exports yet</p>
          <p className="text-xs text-gray-400">Click &quot;Export&quot; above to create your first export</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exports.map((exportItem) => (
            <div
              key={exportItem.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{exportItem.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(exportItem.fileSize)} • {exportItem.format.toUpperCase()} •{' '}
                    {new Date(exportItem.exportedAt).toLocaleString()}
                  </p>
                  {exportItem.exportedBy && (
                    <p className="text-xs text-gray-400">
                      Exported by {exportItem.exportedBy.firstName} {exportItem.exportedBy.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDownload(exportItem.id, exportItem.fileName)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Download"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(exportItem.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportHistory;
