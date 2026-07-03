// Hipoteza forms -> Brevo. AWS Lambda (Node.js 20, ESM, no dependencies).
//
// Receives JSON from the signup / reviewer / project forms, upserts the contact
// in Brevo and (optionally) emails a notification with the full submission.
// The Brevo API key lives ONLY as a Lambda environment variable, never in the
// public site. Configure via environment variables:
//   BREVO_API_KEY   (secret, required for real delivery)
//   SIGNUP_LIST_ID  (optional Brevo list id to add contacts to)
//   NOTIFY_EMAIL    (optional; where to email new submissions)
//   SENDER_EMAIL    (optional; verified Brevo sender, defaults to NOTIFY_EMAIL)
//   ALLOW_ORIGIN    (CORS origin, e.g. https://hipoteza.isy.sh)

const BREVO = "https://api.brevo.com/v3";

function cors() {
  return {
    "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
  };
}
function resp(statusCode, obj) {
  return { statusCode, headers: cors(), body: JSON.stringify(obj) };
}

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || "POST";
  if (method === "OPTIONS") return resp(204, {});
  if (method !== "POST") return resp(405, { error: "method_not_allowed" });

  const raw = event.body || "{}";
  if (raw.length > 20000) return resp(413, { error: "too_large" });

  let data;
  try {
    let body = raw;
    if (event.isBase64Encoded) body = Buffer.from(body, "base64").toString("utf8");
    data = JSON.parse(body);
  } catch {
    return resp(400, { error: "bad_json" });
  }

  // Honeypot: real users never fill a hidden field. Pretend success, drop silently.
  if (data.hp || data.website) return resp(200, { ok: true });

  const email = String(data.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return resp(400, { error: "bad_email" });
  if (email.length > 254) return resp(400, { error: "bad_email" });
  if (data.consent !== true) return resp(400, { error: "consent_required" });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return resp(503, { error: "brevo_not_configured" });

  const type =
    data.type === "reviewer" ? "reviewer" : data.type === "project" ? "project" : "signup";

  // 1) Upsert contact in Brevo
  const attributes = { HIPOTEZA_TYPE: type };
  const displayName = data.name || data.lead;
  if (displayName) attributes.FIRSTNAME = displayName;
  if (data.rola) attributes.HIPOTEZA_ROLE = data.rola;

  const listIds = [];
  const listId = parseInt(process.env.SIGNUP_LIST_ID || "", 10);
  if (!Number.isNaN(listId)) listIds.push(listId);

  try {
    await brevo("/contacts", apiKey, { email, attributes, listIds, updateEnabled: true });
  } catch (e) {
    console.error("brevo contact:", e.message);
  }

  // 2) Notification email with the full submission (useful for reviewer/project)
  const notify = process.env.NOTIFY_EMAIL;
  if (notify) {
    try {
      await brevo("/smtp/email", apiKey, {
        sender: { email: process.env.SENDER_EMAIL || notify, name: "Hipoteza" },
        to: [{ email: notify }],
        replyTo: { email },
        subject: `Hipoteza: nowe zgloszenie (${type})`,
        htmlContent: renderHtml(type, data),
      });
    } catch (e) {
      console.error("brevo email:", e.message);
    }
  }

  return resp(200, { ok: true, type });
};

async function brevo(path, apiKey, body) {
  const r = await fetch(BREVO + path, {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`${path} ${r.status}: ${t.slice(0, 200)}`);
  }
  return r.status;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function renderHtml(type, d) {
  const skip = new Set(["consent", "source", "type"]);
  const rows = Object.keys(d)
    .filter((k) => !skip.has(k) && d[k] !== "" && d[k] != null)
    .map(
      (k) =>
        `<tr><td style="padding:4px 12px;color:#556;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:4px 12px">${esc(d[k])}</td></tr>`
    )
    .join("");
  return `<h2 style="font-family:sans-serif">Nowe zgłoszenie: ${esc(type)}</h2><table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows}</table>`;
}
