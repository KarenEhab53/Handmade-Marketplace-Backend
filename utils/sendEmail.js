const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // use this for testing
      to,
      subject,
      text,
    });

    if (error) throw new Error(error.message);

    console.log("Email sent: " + data.id);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
