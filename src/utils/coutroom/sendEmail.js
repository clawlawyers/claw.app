const nodemailer = require("nodemailer");
const {
  MAIL_HOST,
  MAIL_USER,
  MAIL_PASS,
} = require("../../config/server-config");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// // Load the HTML template
// const templatePath = path.join(__dirname, "htmlTemplates", "newBooking.html");
// let htmlTemplate;
// try {
//   htmlTemplate = fs.readFileSync(templatePath, "utf-8");
// } catch (err) {
//   console.log(__dirname);
//   console.log("Current working directory:", process.cwd());
//   console.error(`Error reading file at ${templatePath}:`, err.message);
//   process.exit(1);
// }

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Courtroom Slot Booking</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .welcome-header {
      color: #3498db;
    }
    .slot-list {
      list-style-type: none;
      padding: 0;
    }
    .slot-list li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="welcome-header">Welcome to Courtroom Slot Booking!</h2>
    <p>Dear {{name}},</p>
    <p>Thank you for booking slots with us. We are excited to have you on board!</p>
    <p>Your booking details are as follows:</p>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Phone Number:</strong> {{phoneNumber}}</p>
    <p><strong>Password:</strong> {{password}}</p>
    <p><strong>Slots Booked:</strong></p>
    <ul class="slot-list">
      {{#each slots}}
      <li>Date: {{date}}, Hour: {{hour}}</li>
      {{/each}}
    </ul>
    <p><strong>Invoice:</strong> <a href="{{invoiceLink}}" target="_blank">View your invoice by Razorpay</a></p>
    <p>If you have any questions or need assistance, feel free to reach out to us.</p>
    <p>Best regards,<br>The Claw Team</p>
  </div>
</body>
</html>
`;

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
