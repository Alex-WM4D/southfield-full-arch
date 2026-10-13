import adminTemplate from "../../emails/admin-notification.html";
import patientTemplate from "../../emails/patient-confirmation.html";
import { PHONE_DISPLAY, PHONE_HREF } from "../../client/src/lib/phone";
import type { AppointmentRequest } from "../../client/src/lib/appointment-request";

/* POST /api/appointment-request (Cloudflare Pages Function).

   Pages Functions cannot open SMTP sockets, so lead emails go through Mailgun's
   HTTPS sending API: POST /v3/{domain}/messages with Basic auth `api:KEY`.
   The admin notification must be accepted by Mailgun before the visitor sees
   success; the patient confirmation is a courtesy and is sent after the
   response so a bad patient address never loses a lead. */

interface Env {
  /** Secret. Use a Mailgun domain sending key, not the account-wide private key. */
  MAILGUN_API_KEY?: string;
  /** e.g. 100marketers.com */
  MAILGUN_DOMAIN?: string;
  /** https://api.eu.mailgun.net for an EU Mailgun domain. */
  MAILGUN_API_BASE?: string;
  /** Must be an authorized sender for MAILGUN_DOMAIN. */
  MAILGUN_FROM?: string;
  /** Admin notification recipient: the reporting inbox only. Practice and
      team notifications are handled outside this site. */
  LEAD_RECIPIENT?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil(promise: Promise<unknown>): void;
}

const SITE_NAME = "Southfield Family Dental Center";
const LOCATION =
  "Southfield, MI (18800 West 10 Mile Road, Southfield, MI 48075)";
const PROCEDURE = "a free full-arch dental implant consultation";
const TIME_ZONE = "America/Detroit";
const LOGO_PATH = "/images/logo_849d8385.png";
const DEFAULT_LEAD_RECIPIENT =
  "reporting_southfield-family-implant-center@100marketers.com";
const DEFAULT_FROM = `${SITE_NAME} <noreply@100marketers.com>`;
const REPLY_TO = "noreply@100marketers.com";
const ADMIN_SUBJECT = "Get on the Horn! A New Patient Wants an Appointment";
const PATIENT_SUBJECT = `Confirmation of Your Appointment Request With ${SITE_NAME}`;
const MAILGUN_TAG = "southfield-appointment-request";
const MAX_BODY_BYTES = 20_000;
// No whitespace, commas, semicolons, quotes or angle brackets, so a visitor
// cannot turn the patient confirmation into a multi-recipient send.
const EMAIL_RE = /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']{2,}$/;
const NANP_RE = /^[2-9]\d{2}[2-9]\d{6}$/;

type Tokens = Record<string, string>;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!
  );
}

// {{token}} is escaped. {{{token}}} is inserted as-is and must be pre-escaped.
// The template's leading comment holds internal notes, so it is not sent.
function render(template: string, tokens: Tokens) {
  return template
    .replace(/^\s*<!--[\s\S]*?-->\s*/, "")
    .replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, key: string) => tokens[key] ?? "")
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
      escapeHtml(tokens[key] ?? "")
    );
}

function htmlToText(markup: string) {
  return markup
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|tr|h[1-6]|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "©")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function formatInZone(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    ...options,
  }).format(date);
}

interface Lead {
  fullName: string;
  nationalPhone: string;
  email: string;
  message: string;
  appointmentSmsConsent: boolean;
  marketingSmsConsent: boolean;
  consentVersion: string;
  sourcePath: string;
}

function validate(input: Partial<AppointmentRequest>): Lead | string {
  const fullName = text(input.fullName, 120).replace(/\s+/g, " ");
  const digits = text(input.phone, 30).replace(/\D/g, "");
  const nationalPhone =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  const email = text(input.email, 254).toLowerCase();
  const sourcePath = text(input.sourcePath, 300);
  const errors = [
    !fullName && "full name",
    !NANP_RE.test(nationalPhone) && "phone",
    !EMAIL_RE.test(email) && "email",
  ].filter(Boolean);
  if (errors.length) return `Please check: ${errors.join(", ")}.`;
  return {
    fullName,
    nationalPhone,
    email,
    message: text(input.message, 2000).replace(/\r\n?/g, "\n"),
    appointmentSmsConsent: input.appointmentSmsConsent === true,
    marketingSmsConsent: input.marketingSmsConsent === true,
    consentVersion: text(input.consentVersion, 40) || "not provided",
    // Only same-site paths; anything else falls back to the home page.
    sourcePath: /^\/(?!\/)/.test(sourcePath) ? sourcePath : "/",
  };
}

async function sendWithMailgun(
  env: Env,
  message: { to: string; subject: string; html: string }
) {
  const apiKey = env.MAILGUN_API_KEY?.trim();
  const domain = env.MAILGUN_DOMAIN?.trim();
  if (!apiKey || !domain) {
    // Name the missing variable, never its value.
    const missing = [!apiKey && "MAILGUN_API_KEY", !domain && "MAILGUN_DOMAIN"]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Mailgun is not configured: missing ${missing}`);
  }
  const apiBase = (
    env.MAILGUN_API_BASE?.trim() || "https://api.mailgun.net"
  ).replace(/\/+$/, "");
  const body = new FormData();
  body.set("from", env.MAILGUN_FROM?.trim() || DEFAULT_FROM);
  body.set("to", message.to);
  body.set("subject", message.subject);
  body.set("html", message.html);
  body.set("text", htmlToText(message.html));
  body.set("h:Reply-To", REPLY_TO);
  body.set("o:tag", MAILGUN_TAG);
  const response = await fetch(
    `${apiBase}/v3/${encodeURIComponent(domain)}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
      body,
    }
  );
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(
      `Mailgun rejected the message (${response.status}): ${detail}`
    );
  }
}

export const onRequestPost = async (
  context: PagesContext
): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin)
    return json(403, { ok: false, error: "Cross-site request rejected." });
  if (!request.headers.get("Content-Type")?.includes("application/json"))
    return json(415, { ok: false, error: "Expected JSON." });
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES)
    return json(413, { ok: false, error: "Request too large." });

  let input: Partial<AppointmentRequest>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) throw new Error("too large");
    input = JSON.parse(raw);
    if (!input || typeof input !== "object") throw new Error("not an object");
  } catch {
    return json(400, { ok: false, error: "Invalid request." });
  }

  const requestId = crypto.randomUUID();
  // Honeypot filled: answer exactly like a success so bots learn nothing.
  if (text(input.website, 200)) return json(200, { ok: true, requestId });

  const lead = validate(input);
  if (typeof lead === "string") return json(400, { ok: false, error: lead });

  const now = new Date();
  const landingPage = new URL(lead.sourcePath, url.origin).href;
  const phone = `(${lead.nationalPhone.slice(0, 3)}) ${lead.nationalPhone.slice(3, 6)}-${lead.nationalPhone.slice(6)}`;
  const tokens: Tokens = {
    site_name: SITE_NAME,
    site_url: `${url.origin}/`,
    site_url_display: url.host,
    site_phone: PHONE_DISPLAY,
    site_phone_href: PHONE_HREF.replace(/^tel:/, ""),
    logo_url: new URL(LOGO_PATH, url.origin).href,
    date_mdy: formatInZone(now, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    submitted_at: `${formatInZone(now, { dateStyle: "medium", timeStyle: "short" })} ET`,
    year: formatInZone(now, { year: "numeric" }),
    procedure: PROCEDURE,
    location: LOCATION,
    landing_page: landingPage,
    full_name: lead.fullName,
    phone,
    phone_href: `+1${lead.nationalPhone}`,
    email: lead.email,
    appointment_sms_consent: lead.appointmentSmsConsent ? "Yes" : "No",
    marketing_sms_consent: lead.marketingSmsConsent ? "Yes" : "No",
    consent_version: lead.consentVersion,
    request_id: requestId,
    message_html: lead.message
      ? escapeHtml(lead.message).replace(/\n/g, "<br />")
      : "No message provided",
  };

  try {
    await sendWithMailgun(env, {
      to: env.LEAD_RECIPIENT?.trim() || DEFAULT_LEAD_RECIPIENT,
      subject: ADMIN_SUBJECT,
      html: render(adminTemplate, tokens),
    });
  } catch (error) {
    // Vendor and credential details stay in the logs, never in the response.
    console.error("Appointment admin notification failed", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    // 500, not 502: Cloudflare replaces 502 bodies with its own error page.
    return json(500, { ok: false, error: "Delivery failed." });
  }

  context.waitUntil(
    sendWithMailgun(env, {
      to: lead.email,
      subject: PATIENT_SUBJECT,
      html: render(patientTemplate, tokens),
    }).catch(error =>
      console.error("Appointment patient confirmation failed", {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
    )
  );

  return json(200, { ok: true, requestId });
};

// Deployment check: reports which settings are present, never their values.
export const onRequestGet = async ({ env }: PagesContext) => {
  const present = (value?: string) => Boolean(value?.trim());
  return json(200, {
    ok: true,
    configured: {
      MAILGUN_API_KEY: present(env.MAILGUN_API_KEY),
      MAILGUN_DOMAIN: present(env.MAILGUN_DOMAIN),
      MAILGUN_API_BASE: present(env.MAILGUN_API_BASE),
      MAILGUN_FROM: present(env.MAILGUN_FROM),
      LEAD_RECIPIENT: present(env.LEAD_RECIPIENT),
    },
  });
};
