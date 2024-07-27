const nodemailer = require("nodemailer");
const {
  MAIL_HOST,
  MAIL_USER,
  MAIL_PASS,
} = require("../../config/server-config");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Load the HTML template
const templatePath = path.join(__dirname, "htmlTemplates", "newBooking.html");
let htmlTemplate;
try {
  htmlTemplate = fs.readFileSync(templatePath, "utf-8");
} catch (err) {
  console.log(__dirname);
  console.log("Current working directory:", process.cwd());
  console.error(`Error reading file at ${templatePath}:`, err.message);
  process.exit(1);
}

const template = handlebars.compile(htmlTemplate);

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

  const filledTemplate = template({
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
    html: filledTemplate,
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
