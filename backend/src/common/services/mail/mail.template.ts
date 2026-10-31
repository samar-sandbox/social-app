type TEmailLayout = {
  title: string;
  header: string;
  bodyHtml: string;
};

type TTemplateData = {
  title: string;
  name: string;
  otp: string;
  expiresInMin: number;
};

function emailLayout({ title, header, bodyHtml }: TEmailLayout) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
      </head>

      <body style="margin:0; padding:0; background:#F3F1ED; font-family:Georgia, 'Times New Roman', serif;">
          <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${header}</div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1ED; padding:40px 16px;">
              <tr>
                  <td align="center">
                      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#17151C; border-radius:10px; overflow:hidden;">
                          <tr>
                            <td style="padding:32px 32px 0 32px; text-align:center;">
                              <span style="font-size:22px; color:#BE8C3D; font-family:Georgia, serif; letter-spacing:0.3px;">
                                Social App
                              </span>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:28px 32px 36px 32px; color:#ECE9E4; font-family:Helvetica, Arial, sans-serif; font-size:15px; line-height:1.6;">
                              ${bodyHtml}
                            </td>
                          </tr>

                          <tr>
                            <td style="padding:20px 32px; border-top:1px solid #322E3D; color:#9A96A6; font-family:Helvetica, Arial, sans-serif; font-size:12px; text-align:center;">
                              Sent by Social App. If you didn't request this, you can ignore this email.
                            </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
    </html>
  `;
}

function otpBlock(otp: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
      <tr>
        <td align="center" style="background:#1F1C26; border:1px solid #322E3D; border-radius:8px; padding:18px 0;">
          <span style="font-family:'Courier New', monospace; font-size:28px; letter-spacing:8px; color:#BE8C3D; font-weight:bold;">
            ${otp}
          </span>
        </td>
      </tr>
    </table>
  `;
}

export function confirmEmailTemplate({
  title,
  name,
  otp,
  expiresInMin,
}: TTemplateData) {
  const bodyHtml = `
    <p style="margin:0 0 4px 0; font-size:18px; color:#ECE9E4; font-family:Georgia, serif;">
      ${title}
    </p>

    <p style="margin:0 0 4px 0; color:#9A96A6;">Hi ${name},</p>
    <p style="margin:0;">Use the code below to confirm your email address and finish setting up your account.</p>

    ${otpBlock(otp)}

    <p style="margin:0; color:#9A96A6; font-size:13px;">
      This code expires in ${expiresInMin} minutes. Didn't sign up for Social App? You can ignore this email.
    </p>
  `;

  return emailLayout({
    title,
    header: `Your confirmation code is ${otp}`,
    bodyHtml,
  });
}

export function resetPasswordTemplate({
  title,
  name,
  otp,
  expiresInMin,
}: TTemplateData) {
  const bodyHtml = `
    <p style="margin:0 0 4px 0; font-size:18px; color:#ECE9E4; font-family:Georgia, serif;">
      ${title}
    </p>

    <p style="margin:0 0 4px 0; color:#9A96A6;">Hi ${name},</p>
    <p style="margin:0;">Someone requested a password reset for your account. Use this code to continue.</p>

    ${otpBlock(otp)}

    <p style="margin:0; color:#9A96A6; font-size:13px;">
      This code expires in ${expiresInMin} minutes. If you didn't request this, your password is still safe — no action needed.
    </p>
  `;

  return emailLayout({
    title,
    header: `Your password reset code is ${otp}`,
    bodyHtml,
  });
}

export function twoStepVerificationTemplate({
  title,
  name,
  otp,
  expiresInMin,
}: TTemplateData) {
  const bodyHtml = `
    <p style="margin:0 0 4px 0; font-size:18px; color:#ECE9E4; font-family:Georgia, serif;">
      ${title}
    </p>
  
    <p style="margin:0 0 4px 0; color:#9A96A6;">Hi ${name},</p>
    <p style="margin:0;">Enter this code to enable 2-step verification.</p>

    ${otpBlock(otp)}

    <p style="margin:0; color:#9A96A6; font-size:13px;">
      This code expires in ${expiresInMin} minutes. If this wasn't you, change your password immediately.
    </p>
  `;

  return emailLayout({
    title,
    header: `Your verification code is ${otp}`,
    bodyHtml,
  });
}
