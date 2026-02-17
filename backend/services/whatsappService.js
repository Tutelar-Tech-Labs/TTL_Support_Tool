import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends WhatsApp Ticket Acknowledgement via Meta Cloud API
 */
export const sendTicketAcknowledgement = async (
  contact_name,
  ticketId,
  issueDescription,
  assignedEngineer,
  engineerPhone,
  contactPhone // recipient
) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      console.warn("⚠️ WhatsApp credentials missing. Skipping notification.");
      return false;
    }

    // Format recipient number
    let formattedPhone = contactPhone.replace(/\D/g, '');

    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('0')) {
      formattedPhone = '91' + formattedPhone.substring(1);
    }

    if (formattedPhone.length < 10) {
      console.warn(`⚠️ Invalid phone: ${contactPhone}`);
      formattedPhone = contactPhone;
    }

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "ticket_acknowledgement",   // ✅ NEW TEMPLATE
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: contact_name },        // {{1}}
              { type: "text", text: ticketId },            // {{2}}
              { type: "text", text: issueDescription },    // {{3}}
              { type: "text", text: assignedEngineer },    // {{4}}
              { type: "text", text: engineerPhone }        // {{5}}
            ]
          }
        ]
      }
    };

    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    console.log(`📤 Sending ticket_acknowledgement to ${formattedPhone}...`);

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ WhatsApp Notification Sent:", response.data);
    return true;

  } catch (error) {
    console.error("❌ WhatsApp Error:");

    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    } else {
      console.error(error.message);
    }

    return false;
  }
};
