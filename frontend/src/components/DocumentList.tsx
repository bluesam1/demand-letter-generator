import { useEffect, useState } from 'react';
import axios from 'axios';

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType?: string;
  processingStatus: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DocumentListProps {
  letterId: string;
  refreshTrigger?: number;
}

export const DocumentList = ({ letterId, refreshTrigger }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/documents`,
          {
            params: { letterId },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setDocuments(response.data.data.documents || []);
      } catch (err) {
        setError(axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to load documents'
          : 'Failed to load documents'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [letterId, refreshTrigger]);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh document list by removing the deleted document from state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      alert(axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to delete document'
        : 'Failed to delete document'
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return '#4CAF50';
      case 'Failed':
        return '#f44336';
      case 'Pending':
      case 'Processing':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading documents...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#f44336', backgroundColor: '#ffebee', borderRadius: '6px' }}>
        Error: {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        <p style={{ margin: 0, fontSize: '16px' }}>No documents uploaded yet</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Upload documents to get started</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
        Uploaded Documents ({documents.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              padding: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#333', fontSize: '15px', marginBottom: '6px' }}>
                {doc.fileName}
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>{doc.fileType}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: getStatusBadgeColor(doc.processingStatus) + '20',
                    color: getStatusBadgeColor(doc.processingStatus),
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                >
                  {doc.processingStatus}
                </span>
                <span style={{ color: '#999' }}>
                  Uploaded by {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                </span>
                <span style={{ color: '#999' }}>
                  {formatDate(doc.uploadedAt)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(doc.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f44336';
                e.currentTarget.style.color = '#f44336';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#666';
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
