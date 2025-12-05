import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface DocumentUploadProps {
  letterId: string;
  onUploadComplete?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const DocumentUpload = ({ letterId, onUploadComplete }: DocumentUploadProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Initialize upload state for each file
      const newUploads: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }));

      setUploadingFiles((prev) => [...prev, ...newUploads]);

      // Upload files
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('letterId', letterId);

      try {
        const token = localStorage.getItem('authToken');
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/documents/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;

              setUploadingFiles((prev) =>
                prev.map((upload) =>
                  acceptedFiles.includes(upload.file)
                    ? { ...upload, progress }
                    : upload
                )
              );
            }
          }
        );

        // Mark all files as success
        setUploadingFiles((prev) =>
          prev.map((upload) =>
            acceptedFiles.includes(upload.file)
              ? { ...upload, status: 'success' as const, progress: 100 }
              : upload
          )
        );

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete();
        }

        // Clear successful uploads after a delay
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.filter((upload) => !acceptedFiles.includes(upload.file))
          );
        }, 2000);
      } catch (error) {
        // Mark files as error
        setUploadingFiles((prev) =>
          prev.map((upload) =>
            acceptedFiles.includes(upload.file)
              ? {
                  ...upload,
                  status: 'error' as const,
                  error: axios.isAxiosError(error)
                    ? error.response?.data?.message || 'Upload failed'
                    : 'Upload failed'
                }
              : upload
          )
        );
      }
    },
    [letterId, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeUpload = (file: File) => {
    setUploadingFiles((prev) => prev.filter((upload) => upload.file !== file));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="document-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
          transition: 'background-color 0.2s'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p style={{ margin: 0, color: '#666' }}>Drop files here...</p>
        ) : (
          <div>
            <p style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px', fontWeight: 500 }}>
              Drag and drop files here, or click to browse
            </p>
            <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
              Supported: PDF, Word (.doc, .docx), Text (.txt), Images (.jpg, .png)
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#999', fontSize: '14px' }}>
              Max file size: 10MB
            </p>
          </div>
        )}
      </div>

      {uploadingFiles.length > 0 && (
        <div className="upload-progress" style={{ marginTop: '20px' }}>
          {uploadingFiles.map((upload, index) => (
            <div
              key={index}
              className="upload-item"
              style={{
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '8px',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#333' }}>{upload.file.name}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                    {formatFileSize(upload.file.size)}
                  </div>
                </div>
                {upload.status === 'error' && (
                  <button
                    onClick={() => removeUpload(upload.file)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '0 8px'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {upload.status === 'uploading' && (
                <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '6px' }}>
                  <div
                    style={{
                      width: `${upload.progress}%`,
                      backgroundColor: '#4CAF50',
                      height: '100%',
                      borderRadius: '4px',
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              )}

              {upload.status === 'success' && (
                <div style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 500 }}>
                  Upload complete
                </div>
              )}

              {upload.status === 'error' && (
                <div style={{ color: '#f44336', fontSize: '14px' }}>
                  {upload.error || 'Upload failed'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
