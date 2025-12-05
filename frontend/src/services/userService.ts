/**
 * User Management Service
 * Handles team management and user invitation operations
 */

import axios from '../api/axiosConfig';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Attorney' | 'Paralegal';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'Admin' | 'Attorney' | 'Paralegal';
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface InviteUsersRequest {
  emails: string[];
  role: 'Admin' | 'Attorney' | 'Paralegal';
}

export interface InviteUsersResponse {
  results: Array<{
    email: string;
    status: 'success' | 'error';
    message?: string;
    invitationId?: string;
    expiresAt?: string;
  }>;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface InvitationsListResponse {
  success: boolean;
  data: {
    invitations: Invitation[];
  };
}

/**
 * Invite users to join the firm
 */
export const inviteUsers = async (request: InviteUsersRequest): Promise<InviteUsersResponse> => {
  const response = await axios.post('/users/invite', request);
  return response.data;
};

/**
 * Accept an invitation and create account
 */
export const acceptInvitation = async (request: AcceptInvitationRequest) => {
  const response = await axios.post('/users/accept-invitation', request);
  return response.data;
};

/**
 * Get all pending invitations for the firm
 */
export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await axios.get<InvitationsListResponse>('/users/invitations');
  return response.data.data.invitations;
};

/**
 * Cancel a pending invitation
 */
export const cancelInvitation = async (invitationId: string): Promise<void> => {
  await axios.delete(`/users/invitations/${invitationId}`);
};

/**
 * Resend an invitation email
 */
export const resendInvitation = async (invitationId: string): Promise<void> => {
  await axios.post(`/users/invitations/${invitationId}/resend`);
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Get all users in the firm
 */
export const getAllUsers = async (params?: {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; pagination: Pagination }> => {
  const response = await axios.get<UsersListResponse>('/users', { params });
  return response.data.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await axios.get(`/users/${userId}`);
  return response.data.data.user;
};

/**
 * Update user (role or active status)
 */
export const updateUser = async (
  userId: string,
  updates: { role?: string; isActive?: boolean }
): Promise<User> => {
  const response = await axios.put(`/users/${userId}`, updates);
  return response.data.data.user;
};

/**
 * Deactivate a user
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  await axios.delete(`/users/${userId}`);
};

/**
 * Reactivate a user
 */
export const reactivateUser = async (userId: string): Promise<User> => {
  const response = await axios.post(`/users/${userId}/reactivate`);
  return response.data.data.user;
};
