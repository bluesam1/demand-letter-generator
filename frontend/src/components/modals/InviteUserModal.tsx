import { useState } from 'react';
import { inviteUsers, InviteUsersRequest } from '../../services/userService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InviteResult {
  email: string;
  status: 'success' | 'error';
  message?: string;
  invitationId?: string;
  expiresAt?: string;
}

interface InviteUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InviteUserModal = ({ onClose, onSuccess }: InviteUserModalProps) => {
  const [emailsText, setEmailsText] = useState('');
  const [role, setRole] = useState<'Admin' | 'Attorney' | 'Paralegal'>('Attorney');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<InviteResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    // Parse emails from text input (comma or newline separated)
    const emails = emailsText
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const request: InviteUsersRequest = { emails, role };
      const response = await inviteUsers(request);

      setResults(response.results);

      // Check if all invitations were successful
      const allSuccess = response.results.every((r) => r.status === 'success');

      if (allSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to send invitations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Invite Team Members" isOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
            Email Addresses
          </label>
          <textarea
            id="emails"
            rows={4}
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            placeholder="Enter one or more email addresses (comma or newline separated)&#10;example@law.com, another@law.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple email addresses with commas or new lines
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Attorney' | 'Paralegal')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="Attorney">Attorney</option>
            <option value="Paralegal">Paralegal</option>
            <option value="Admin">Admin</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select the role for the invited users
          </p>
        </div>

        {results && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900">Invitation Results:</h4>
            {results.map((result: InviteResult, index: number) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.status === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <span className="font-medium">{result.email}:</span>{' '}
                {result.status === 'success' ? 'Invited successfully' : result.message}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending Invitations...' : 'Send Invitations'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteUserModal;
