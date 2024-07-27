const nodemailer = require("nodemailer");
const {
  MAIL_HOST,
  MAIL_USER,
  MAIL_PASS,
} = require("../../config/server-config");
const fs = require("fs");
const path = require("path");

// Construct the absolute path to the HTML template
const templatePath = path.join(__dirname, "htmlTemplates", "newBooking.html");

// Load the HTML template
let htmlTemplate;
try {
  htmlTemplate = fs.readFileSync(templatePath, "utf-8");
} catch (err) {
  console.error(`Error reading file at ${templatePath}:`, err.message);
  process.exit(1);
}

// Function to replace placeholders in the template
function replacePlaceholders(template, details) {
  let result = template
    .replace(/{{name}}/g, details.name)
    .replace(/{{phoneNumber}}/g, details.phoneNumber)
    .replace(/{{password}}/g, details.password)
    .replace(/{{invoiceLink}}/g, details.invoiceLink);

  const slotsList = details.slots
    .map((slot) => `<li>Date: ${slot.date}, Hour: ${slot.hour}</li>`)
    .join("");
  result = result.replace(/{{slots}}/g, slotsList);

  return result;
}

// Function to send confirmation email
const sendConfirmationEmail = async (
  email,
  name,
  phoneNumber,
  password,
  slots,
  invoiceResponse
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    logger: true,
    debug: true,
    secureConnection: true,
    auth: {
      user: MAIL_USER, // Replace with your email
      pass: MAIL_PASS, // Replace with your email password
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const replacedHtml = replacePlaceholders(htmlTemplate, {
    name,
    phoneNumber,
    password,
    slots,
    invoiceLink: "https://example.com/invoice/12345", // Replace with your invoice link
  });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "Courtroom Booking Confirmation",
    html: replacedHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
  // console.log(info);
};

module.exports = {
  sendConfirmationEmail,
};
