import { Resend } from "resend";
import twilio from "twilio";

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SERVICE_ZIPS = new Set([
  "12550",
  // add more valid zips 
]);

function validateRequestBody(body) {
  const errors = [];

  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  const email = (body.email || "").trim();
  const address = (body.address || "").trim();
  const zip = (body.zip || "").trim();
  const message = (body.message || "").trim();

  if (name.length < 2 || name.length > 100) {
    errors.push("Name must be between 2 and 100 characters.");
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push("Phone must be a valid phone number.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email must be a valid email address.");
  }

  if (address.length < 5 || address.length > 200) {
    errors.push("Address must be between 5 and 200 characters.");
  }

  if (!/^[0-9]{5}$/.test(zip)) {
    errors.push("ZIP must be a 5-digit code.");
  }

  if (message.length > 1000) {
    errors.push("Message is too long.");
  }

  return {
    errors,
    cleaned: { name, phone, email, address, zip, message },
  };
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const { errors, cleaned } = validateRequestBody(req.body || {});
  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: errors.join(" ") });
  }

  const { name, phone, email, address, zip, message } = cleaned;

  if (!SERVICE_ZIPS.has(zip)) {
    return res.status(400).json({
      ok: false,
      error: "We currently only service specific areas. Please call for details.",
    });
  }

  try {
    // 1) Send EMAIL via Resend
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // e.g. "Alpine HVAC <no-reply@yourdomain.com>"
      to: process.env.TECH_EMAIL,          // where the tech gets the email
      subject: "New HVAC Service Request",
      text: `
            New HVAC service request:

            Name:    ${name}
            Phone:   ${phone}
            Email:   ${email || "N/A"}
            Address: ${address}
            ZIP:     ${zip}

            Issue:
            ${message || "No additional details."}

            Sent from: Alpine HVAC website
            `,
    });

    // 2) Send SMS via Twilio
    await twilioClient.messages.create({
      body: `New HVAC Request: ${name}, ${phone}, ZIP ${zip}. Check your email for details.`,
      from: process.env.TWILIO_FROM_PHONE, // your Twilio number
      to: process.env.TECH_PHONE,          // technician's real phone
    });

    console.log("New HVAC service request processed:", cleaned);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in /api/request-service:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to process service request." });
  }
}