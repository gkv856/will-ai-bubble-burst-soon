import { Resend } from "resend";

const SITE_URL = "https://will-ai-bubble-burst-soon.vercel.app/";

function scoreColor(score: number) {
  if (score < 40) return "#10B981";
  if (score < 70) return "#F59E0B";
  return "#EF4444";
}

async function getLatestScore(): Promise<number | null> {
  try {
    const res = await fetch(`${SITE_URL}history.json`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const score = Array.isArray(data) ? data[data.length - 1]?.score : null;
    return typeof score === "number" ? score : null;
  } catch {
    return null;
  }
}

function welcomeEmailHtml(score: number | null) {
  const pct = score !== null ? Math.max(0, Math.min(100, score)) : null;
  const markerRow =
    pct !== null
      ? `<tr>
            <td style="padding:0 32px 4px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="${pct}%" style="font-size:0;line-height:0;">&nbsp;</td>
                  <td style="white-space:nowrap;text-align:left;">
                    <div style="font-size:11px;font-weight:700;color:${scoreColor(score!)};line-height:1.3;margin-left:-2px;">${score} · today</div>
                    <div style="font-size:10px;color:${scoreColor(score!)};line-height:1;margin-left:-2px;">▼</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>You're on the alert list</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:'IBM Plex Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">One email. The moment risk turns red. Nothing else.</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0F172A;padding:18px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#F8FAFC;font-size:13px;font-weight:700;letter-spacing:0.08em;">AI BUBBLE TRACKER</td>
                  <td align="right" style="color:#FBBF24;font-size:12px;font-weight:600;letter-spacing:0.04em;">● LIVE</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="56" height="56" align="center" valign="middle" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:28px;font-size:24px;font-weight:700;color:#DC2626;">!</td>
                </tr>
              </table>
              <h1 style="margin:20px 0 10px 0;font-size:22px;line-height:1.3;color:#0F172A;font-weight:700;">You're on the alert list</h1>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.65;color:#475569;">
                We'll send you <strong style="color:#0F172A;">one email</strong> — the moment the composite risk score enters Bubble Territory. Early enough to sell, hedge, or short before everyone else reacts.
              </p>
            </td>
          </tr>

          <!-- Risk gauge -->
          ${markerRow}
          <tr>
            <td style="padding:0 32px 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:6px;overflow:hidden;">
                <tr style="height:8px;">
                  <td width="40%" style="background-color:#10B981;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="30%" style="background-color:#F59E0B;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="30%" style="background-color:#EF4444;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#94A3B8;text-align:center;">
                Healthy&nbsp;&nbsp;→&nbsp;&nbsp;Elevated&nbsp;&nbsp;→&nbsp;&nbsp;<strong style="color:#DC2626;">we email you here</strong>
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 32px 36px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#DC2626;border-radius:8px;">
                    <a href="${SITE_URL}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">View Live Dashboard →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid #E2E8F0;"></div>
            </td>
          </tr>

          <!-- Deliverability tip, framed as user's own benefit -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#0F172A;">Make sure you actually see it</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
                Gmail often files first-time senders under Promotions or Spam. If you want to catch the crash warning the moment it fires — not three days late — drag this email into your Primary inbox now, or mark it "Not spam." Five seconds now, so you don't miss the one email that actually matters.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;background-color:#F8FAFC;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#94A3B8;text-align:center;">
                Not financial advice. You're receiving this because you subscribed at will-ai-bubble-burst-soon.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Best-effort welcome email — subscription still succeeds if this fails
// or if Resend isn't configured yet.
export async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  const score = await getLatestScore();

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `AI Bubble <${from}>`,
    to: email,
    subject: "You're on the alert list — AI Bubble Tracker",
    html: welcomeEmailHtml(score),
  });
}
