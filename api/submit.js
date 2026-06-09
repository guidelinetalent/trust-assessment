const { Resend } = require('resend');

const FROM_EMAIL = 'Preston at Guideline Talent <onboarding@resend.dev>';
const PRESTON_EMAIL = 'preston@guidelinetalent.com';
const BOOKING_URL = 'https://guidelinetalent-free-coaching-session.youcanbook.me';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, scores, total, tier, tierDesc, sessionRequest, pdfBase64 } = req.body || {};

  if (!name || !email || !scores || !total || !tier) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const dimRows = [
    { label: 'Transparency & Consistency',        score: scores.transparency  },
    { label: 'Confidentiality & Active Listening', score: scores.confidentiality },
    { label: 'Competence & Visibility',            score: scores.competence    },
  ];

  const dimHtml = dimRows.map(d =>
    `<tr>
      <td style="padding:8px 0;font-size:14px;color:#213526;font-weight:500;">${d.label}</td>
      <td style="padding:8px 0;font-size:14px;color:#213526;text-align:right;font-weight:600;">${d.score} / 50</td>
    </tr>`
  ).join('');

  // ---- Email to participant ----
  const participantHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f7e8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f7e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#213526;padding:28px 32px;">
          <div style="font-size:13px;color:#c5d9b0;margin-bottom:12px;">🌿 Guideline Talent</div>
          <div style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#e6efcd;line-height:1.2;">
            Your HR Trust Assessment Results
          </div>
        </td></tr>

        <!-- Score block -->
        <tr><td style="background:#e6efcd;padding:24px 32px;">
          <div style="font-size:13px;color:#4d6654;margin-bottom:4px;">Overall Score</div>
          <div style="font-family:Georgia,serif;font-size:52px;font-weight:700;color:#213526;line-height:1;">${total}</div>
          <div style="font-size:13px;color:#4d6654;margin-bottom:8px;">out of 150</div>
          <div style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#213526;">${tier}</div>
          <div style="font-size:13px;color:#324b39;margin-top:8px;line-height:1.6;">${tierDesc}</div>
        </td></tr>

        <!-- Dimension breakdown -->
        <tr><td style="padding:24px 32px 8px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4d6654;margin-bottom:12px;">Dimension Breakdown</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e0e0dd;">
            ${dimHtml}
          </table>
        </td></tr>

        <!-- Body copy -->
        <tr><td style="padding:8px 32px 24px;">
          <p style="font-size:14px;color:#5a7060;line-height:1.75;margin:0 0 16px;">
            Hi ${name} — your full report is attached as a PDF. It includes your dimension scores, personalized feedback for each area, and three specific actions to take this week.
          </p>
          <p style="font-size:14px;color:#5a7060;line-height:1.75;margin:0;">
            These results point to specific, high-leverage shifts — not generic advice. If you'd like to talk through what they mean for where you go next in your career, I offer a free 30-minute coaching conversation.
          </p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 32px 32px;">
          <a href="${BOOKING_URL}" style="display:block;background:#213526;color:#e6efcd;font-family:Georgia,serif;font-size:16px;font-weight:700;padding:14px 24px;border-radius:8px;text-decoration:none;text-align:center;">
            Book a Free Coaching Session →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f2f7e8;padding:20px 32px;border-top:1px solid #e0e0dd;">
          <p style="font-size:12px;color:#8a8a85;margin:0;line-height:1.6;text-align:center;">
            Preston Sharpston · Guideline Talent<br>
            <a href="https://guidelinetalent.com" style="color:#4d6654;">guidelinetalent.com</a> ·
            <a href="https://linkedin.com/in/prestonsharpston" style="color:#4d6654;">LinkedIn</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ---- Email to Preston (lead notification) ----
  const prestonHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f2f7e8;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
    <div style="background:#213526;padding:20px 24px;">
      <div style="color:#e6efcd;font-size:18px;font-weight:bold;">New Trust Assessment Lead</div>
      <div style="color:#a8c48a;font-size:13px;margin-top:4px;">${new Date().toLocaleString()}</div>
    </div>
    <div style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;font-size:13px;color:#666;width:120px;">Name</td><td style="padding:6px 0;font-size:14px;color:#213526;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Email</td><td style="padding:6px 0;font-size:14px;color:#213526;">${email}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Score</td><td style="padding:6px 0;font-size:14px;color:#213526;">${total} / 150 — ${tier}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Transparency</td><td style="padding:6px 0;font-size:14px;color:#213526;">${scores.transparency} / 50</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Confidentiality</td><td style="padding:6px 0;font-size:14px;color:#213526;">${scores.confidentiality} / 50</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Competence</td><td style="padding:6px 0;font-size:14px;color:#213526;">${scores.competence} / 50</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#666;">Session Request</td>
            <td style="padding:6px 0;font-size:14px;font-weight:bold;color:${sessionRequest ? '#1a7a4a' : '#888'};">${sessionRequest ? '✅ YES — follow up needed' : 'No'}</td></tr>
      </table>
    </div>
    ${sessionRequest ? `<div style="background:#e6efcd;padding:14px 24px;margin:0 16px 16px;border-radius:8px;font-size:13px;color:#213526;"><strong>Action needed:</strong> ${name} requested a free coaching session. Reply to ${email} to schedule.</div>` : ''}
  </div>
</body>
</html>`;

  try {
    // Build attachments array — only include PDF if it was generated
    const attachments = [];
    if (pdfBase64 && pdfBase64.length > 100) {
      attachments.push({
        filename: 'HR-Trust-Assessment-' + name.replace(/\s+/g, '-') + '.pdf',
        content: pdfBase64,
      });
    }

    // Send to participant
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Your HR Trust Assessment Results — ' + tier,
      html: participantHtml,
      attachments: attachments,
    });

    // Notify Preston
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [PRESTON_EMAIL],
      subject: (sessionRequest ? '[Session Requested] ' : '') + 'Trust Assessment — ' + name + ' · ' + total + '/150',
      html: prestonHtml,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    // Still return 200 so the frontend shows results even if email fails
    return res.status(200).json({ success: false, note: 'Email delivery failed but results are shown' });
  }
};
