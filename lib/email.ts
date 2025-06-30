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
    console.log(`[EMAIL] Attempting to send email to: ${to}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    console.log(`[EMAIL] From: ${from || process.env.EMAIL_FROM || "noreply@henryscheinone.com"}`)

    console.log("[EMAIL] Sending email via Resend...")

    const result = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || "noreply@henryscheinone.com",
      to: [to],
      subject,
      html,
    })

    console.log("[EMAIL] Resend response:", result)

    if (result.error) {
      console.error("[EMAIL] Resend error:", result.error)
      return false
    }

    console.log("[EMAIL] Email sent successfully:", result.data?.id)
    return true
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error)
    console.error("[EMAIL] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    return false
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@henryscheinone.com",
      to: [email],
      subject: "Reset Your Password - HS1 Careers Matrix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested to reset your password for the HS1 Careers Matrix.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the HS1 Careers Matrix system.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Email send error:", error)
      return { success: false, error: error.message }
    }

    console.log("Password reset email sent:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Email service error:", error)
    return { success: false, error: "Failed to send email" }
  }
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
