// Shared by the appointment form and functions/api/appointment-request.ts, so
// the consent text and version recorded with a lead always match the form.
export const SMS_CONSENT_VERSION = "2026-10-09-v1";
export const APPOINTMENT_SMS_CONSENT =
  "I agree to receive text messages from Southfield Family Dental Center about my appointment request, scheduling, confirmations, and reminders at the phone number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.";
export const MARKETING_SMS_CONSENT =
  "I agree to receive recurring promotional text messages from Southfield Family Dental Center about dental services and special offers at the phone number provided, including messages sent using automated technology. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.";

export const APPOINTMENT_REQUEST_ENDPOINT = "/api/appointment-request";

export interface AppointmentRequest {
  fullName: string;
  phone: string;
  email: string;
  message: string;
  appointmentSmsConsent: boolean;
  marketingSmsConsent: boolean;
  consentVersion: string;
  appointmentConsentText: string;
  marketingConsentText: string;
  sourcePath: string;
  clientSubmittedAt: string;
  // Honeypot: hidden from people, so any value means a bot filled the form.
  website: string;
}

export async function submitAppointmentRequest(
  request: AppointmentRequest
): Promise<{ requestId: string }> {
  const response = await fetch(APPOINTMENT_REQUEST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });
  const body = (await response.json().catch(() => null)) as {
    requestId?: unknown;
  } | null;
  if (!response.ok || typeof body?.requestId !== "string" || !body.requestId)
    throw new Error(`Appointment request failed (${response.status})`);
  return { requestId: body.requestId };
}
