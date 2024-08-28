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
    <p><strong>Total cost :</strong> {{amount}}</p>
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
  amount
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
    amount: amount, // Replace with your invoice link
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

async function sendAdminContactUsNotification(contactDetails) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAIL_USER, // Replace with your email
      pass: MAIL_PASS, // Replace with your email password
    },
  });

  const mailOptions = {
    from: `${contactDetails.email}`,
    to: "claw.lawyers@gmail.com", // Replace with your administrator's email address
    subject: "New Contact Us Query Received",
    html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Us Query</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                  }
                  .container {
                      width: 80%;
                      margin: auto;
                      overflow: hidden;
                      background: #fff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                      color: #333;
                  }
                  p {
                      margin: 0 0 10px;
                  }
                  .footer {
                      margin-top: 20px;
                      padding: 10px;
                      background-color: #eee;
                      text-align: center;
                      border-radius: 8px;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>New Contact Us Query Received</h1>
                  <p>Dear Administrator,</p>
                  <p>A new contact us query has been submitted. Below are the details:</p>
                  <p><strong>First Name:</strong> ${contactDetails.firstName}</p>
                  <p><strong>Last Name:</strong> ${contactDetails.lastName}</p>
                  <p><strong>Email:</strong> ${contactDetails.email}</p>
                  <p><strong>Phone Number:</strong> ${contactDetails.phoneNumber}</p>
                  <p><strong>Preferred Contact Mode:</strong> ${contactDetails.preferredContactMode}</p>
                  <p><strong>Business Name:</strong> ${contactDetails.businessName}</p>
                  <p><strong>Query:</strong></p>
                  <p>${contactDetails.query}</p>
                  <p>Please review the query and respond as necessary.</p>
                  <p>Best regards,<br>Your Company Name</p>
                  <div class="footer">
                      <p>This email was automatically generated by Your Company Name.</p>
                  </div>
              </div>
          </body>
          </html>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Notification email sent successfully");
  } catch (error) {
    console.log("Error sending email:", error.message);
  }
}

module.exports = {
  sendConfirmationEmail,
  sendAdminContactUsNotification,
};
