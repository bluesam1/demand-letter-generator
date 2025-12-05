/**
 * Email service for sending transactional emails
 * Currently using console logging as placeholder for SendGrid integration
 */

export interface InvitationEmailData {
  email: string;
  activationUrl: string;
  firmName: string;
  role: string;
  expiresAt: Date;
}

/**
 * Send invitation email to a new user
 * TODO: Integrate with SendGrid when API key is available
 */
export const sendInvitationEmail = async (data: InvitationEmailData): Promise<void> => {
  // Placeholder implementation - logs to console
  // In production, this will send via SendGrid

  const emailTemplate = `
=================================
INVITATION EMAIL
=================================
To: ${data.email}
Subject: You're invited to join ${data.firmName} on Demand Letter Generator

Body:
Hi there,

You've been invited to join ${data.firmName} on the Demand Letter Generator platform.

Role: ${data.role}
Invitation Expires: ${data.expiresAt.toLocaleDateString()}

Click the link below to accept your invitation and set up your password:
${data.activationUrl}

If you have any questions, please contact your firm administrator.

Best regards,
The Demand Letter Generator Team
=================================
  `.trim();

  // eslint-disable-next-line no-console
  console.log('\n--- EMAIL SERVICE (PLACEHOLDER) ---');
  // eslint-disable-next-line no-console
  console.log(emailTemplate);
  // eslint-disable-next-line no-console
  console.log('--- END EMAIL ---\n');

  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Send password reset email
 * TODO: Integrate with SendGrid
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  const emailTemplate = `
=================================
PASSWORD RESET EMAIL
=================================
To: ${email}
Subject: Reset Your Password - Demand Letter Generator

Body:
Hi,

You requested to reset your password. Click the link below to continue:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The Demand Letter Generator Team
=================================
  `.trim();

  // eslint-disable-next-line no-console
  console.log('\n--- EMAIL SERVICE (PLACEHOLDER) ---');
  // eslint-disable-next-line no-console
  console.log(emailTemplate);
  // eslint-disable-next-line no-console
  console.log('--- END EMAIL ---\n');

  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Send role change notification email
 * TODO: Integrate with SendGrid
 */
export const sendRoleChangeEmail = async (
  email: string,
  newRole: string,
  changedBy: string
): Promise<void> => {
  const emailTemplate = `
=================================
ROLE CHANGE NOTIFICATION
=================================
To: ${email}
Subject: Your Role Has Been Updated

Body:
Hi,

Your role in the Demand Letter Generator has been updated to: ${newRole}

Changed by: ${changedBy}

Your permissions have been updated accordingly.

Best regards,
The Demand Letter Generator Team
=================================
  `.trim();

  // eslint-disable-next-line no-console
  console.log('\n--- EMAIL SERVICE (PLACEHOLDER) ---');
  // eslint-disable-next-line no-console
  console.log(emailTemplate);
  // eslint-disable-next-line no-console
  console.log('--- END EMAIL ---\n');

  await new Promise(resolve => setTimeout(resolve, 100));
};
