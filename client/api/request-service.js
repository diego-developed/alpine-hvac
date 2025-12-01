import { Resend } from "resend";
import twilio from "twilio";

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SERVICE_ZIPS = new Set([
  "12550","12555","12551","12552","12512","12511","12527","12542","12568","12508","12584","12553","12537","12575","12520","12524","12586","12547","12577","12518","12590","12548","12589","10516","12543","10953","12515","10992","10996","10997","12549","10914","10930","10524","12604","10916","12602","12525","12601","12528","12603","12533","10922","10928","10917","10579","12561","10911","10537","10941","10949","12566","12582","10915","12510","10918","10926","10950","10985","10919","12722","10512","10986","12493","10588","10547","10542","10566","12588","12569","10541","10535","12440","12540","10567","10517","12531","10910","12538","12429","10511","10981","12570","12420","10924","10980","10596","12721","10505","12471","12486","10527","10548","10975","12472","12585","10521","10598","10540","12489","12769","10587","12781","12483","12419","10932","10501","12446","12404","12578","12487","10921","10984","10993","10923","10958","10940","12564","12580","12563","12411","12484","10519","10970","10589","10520","10912","10927","10578","10509","10973","10987","12428","12545","12790","12417","12522","10990","12466","10526","10536","10963","10562","10560","10925","10956","10974","12574","10933","10546","10920","12402","12458","12763","12443","10545","12401","10901","12594","12514","10507","12461","12435","12572","12785","12775","10979","10959","10597","10969","06784","10549","10514","10952","10977","06812","10510","10931","10989","10518","12506","12738","10982","06755","10998",
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