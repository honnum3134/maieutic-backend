const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html, attachments = []) => {
  await resend.emails.send({
    from: 'Maieutic Edutech <onboarding@resend.dev>',
    to,
    subject,
    html,
    ...(attachments.length > 0 && { attachments }),
  });
};

module.exports = sendEmail;