const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const isEmailConfigured = Boolean(RESEND_API_KEY);

const FROM =
  process.env.EMAIL_FROM ??
  "Huawei Events <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[email] Resend error", res.status, text);
    return false;
  }
  return true;
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#111">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px 16px">
      <tr><td style="font-size:20px;font-weight:700;color:#c7000b;padding-bottom:16px">Huawei Events</td></tr>
      <tr>
        <td style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #ececec">
          <h1 style="margin:0 0 16px;font-size:18px;font-weight:700">${title}</h1>
          ${body}
        </td>
      </tr>
      <tr><td style="padding-top:20px;font-size:12px;color:#888">You received this email from Huawei Events.</td></tr>
    </table>
  </body>
</html>`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const infoRow = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;font-size:13px;color:#666;width:130px">${esc(label)}</td><td style="padding:6px 0;font-size:13px;font-weight:600">${esc(value)}</td></tr>`;

export interface RegistrationEmailData {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  registrationId: string;
  fullName: string;
  email: string;
  status: string;
  waitlistPosition?: number;
  eventUrl: string;
}

export async function sendAttendeeConfirmation(
  to: string,
  data: RegistrationEmailData,
): Promise<boolean> {
  const body =
    data.status === "waitlisted"
      ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6">Hi ${esc(data.fullName)},</p>
         <p style="margin:0 0 16px;font-size:14px;line-height:1.6">The event is full, so you've been added to the waitlist for <strong>${esc(data.eventTitle)}</strong>. You are position <strong>#${data.waitlistPosition ?? 1}</strong>. We'll email you if a spot opens up.</p>`
      : `<p style="margin:0 0 16px;font-size:14px;line-height:1.6">Hi ${esc(data.fullName)},</p>
         <p style="margin:0 0 16px;font-size:14px;line-height:1.6">You're confirmed for <strong>${esc(data.eventTitle)}</strong>. Here are your details:</p>`;
  const html = shell(
    data.status === "waitlisted" ? "You're on the waitlist" : "Registration confirmed",
    `${body}
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 20px">
       ${infoRow("Event", data.eventTitle)}
       ${infoRow("Date", data.eventDate)}
       ${infoRow("Time", data.eventTime)}
       ${infoRow("Venue", `${data.venue}, ${data.city}`)}
       ${infoRow("Confirmation", data.registrationId)}
     </table>
     <p style="margin:0"><a href="${esc(data.eventUrl)}" style="display:inline-block;background:#c7000b;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:8px">View event details</a></p>`,
  );
  return sendEmail({ to, subject: `Registration ${data.status === "waitlisted" ? "waitlist" : "confirmed"} – ${data.eventTitle}`, html });
}

export async function sendAdminNewRegistration(
  adminEmail: string,
  data: RegistrationEmailData,
): Promise<boolean> {
  const html = shell(
    "New registration",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6"><strong>${esc(data.fullName)}</strong> registered for <strong>${esc(data.eventTitle)}</strong>.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px">
       ${infoRow("Email", data.email)}
       ${infoRow("Status", data.status)}
       ${infoRow("Registration", data.registrationId)}
       ${infoRow("Event", data.eventTitle)}
       ${infoRow("Date", data.eventDate)}
       ${infoRow("Time", data.eventTime)}
     </table>`,
  );
  return sendEmail({
    to: adminEmail,
    subject: `New registration – ${data.eventTitle}`,
    html,
  });
}

