import { Resend } from "resend"

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions): Promise<boolean> {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("[EMAIL] Resend API key not configured, falling back to console logging")
      console.log(`[EMAIL] To: ${to}`)
      console.log(`[EMAIL] Subject: ${subject}`)
      console.log(`[EMAIL] HTML: ${html}`)
      return false
    }

    const result = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || "noreply@henryscheinone.com",
      to: [to],
      subject,
      html,
    })

    if (result.error) {
      console.error("[EMAIL] Resend error:", result.error)
      return false
    }

    console.log("[EMAIL] Email sent successfully:", result.data?.id)
    return true
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
  const subject = "Reset Your Password - Henry Schein One Career Matrix"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 Henry Schein One</h1>
        <p>Career Development Matrix</p>
      </div>
      
      <div class="content">
        <h2>Reset Your Password</h2>
        
        <p>Hello ${name},</p>
        
        <p>We received a request to reset your password for the Henry Schein One Career Development Matrix. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
          ${resetUrl}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong>
          <ul>
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>You can only use this link once</li>
            <li>If you didn't request this reset, please contact your administrator</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This email was sent from the Henry Schein One Career Development Matrix.</p>
          <p>If you have any questions, please contact your system administrator.</p>
          <p><strong>Do not reply to this email.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject,
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, temporaryPassword: string): Promise<boolean> {
  const subject = "Welcome to Henry Schein One Career Matrix"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Career Matrix</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .credentials {
          background-color: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
          font-family: monospace;
        }
        .button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 Welcome to Henry Schein One</h1>
        <p>Career Development Matrix</p>
      </div>
      
      <div class="content">
        <h2>Your Account is Ready!</h2>
        
        <p>Hello ${name},</p>
        
        <p>Welcome to the Henry Schein One Career Development Matrix! Your account has been created and you can now access the system.</p>
        
        <div class="credentials">
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" class="button">Login Now</a>
        </div>
        
        <p><strong>Important:</strong> Please change your password after your first login for security.</p>
        
        <h3>What you can do:</h3>
        <ul>
          <li>🔍 Explore career paths and role requirements</li>
          <li>📊 Review skill matrices for different positions</li>
          <li>📝 Conduct self-assessments</li>
          <li>📈 Compare roles and skill requirements</li>
        </ul>
        
        <p>If you have any questions, please contact your system administrator.</p>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject,
    html,
  })
}
