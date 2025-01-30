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
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Courtroom Slot Booking</title>
    <style>
      body {
        font-family: "Arial", sans-serif;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .top-container {
      }
      .text-container {
        padding-left: 15px;
        text-align: left;
        color: #333;
      }
      .text-container > p {
        margin: 0;
        color: gray;
      }
      .text-container > h3 {
        margin: 5px 0px;
      }
      .bottom-container {
      }
    </style>
  </head>
  <body>
    <div class="top-container">
      <img src="https://claw-gpt-dev.netlify.app/header.png" alt="header.png" />
    </div>
    <div class="text-container">
      <p>Dear {{name}},</p>
      <p>
        Thank you for booking slots with us. We are excited to have you on
        board!
      </p>
      <p>Your booking details are as follows:</p>
      <h3><strong>Name:</strong> {{name}}</h3>
      <h3><strong>Phone Number:</strong> {{phoneNumber}}</h3>
      <h3><strong>Password:</strong> {{password}}</h3>
      <h3><strong>Slots Booked:</strong></h3>
      <ul class="slot-list">
        {{#each slots}}
        <li>
          <strong>Date: </strong>{{date}}, <strong>Hour: </strong>{{hour}}
        </li>
        {{/each}}
      </ul>
      <h3><strong>Total cost :</strong> {{amount}}</h3>
    </div>
    <div class="bottom-container">
      <img src="https://claw-gpt-dev.netlify.app/footer.png" alt="footer.png" />
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

// Template for database access granted email
const databaseAccessTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>File Access Granted</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #333333;
    }
    p {
      color: #555555;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      background-color: #4CAF50;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Access Granted to Your File</h2>
    <p>Hello,</p>
    <p>You have been granted access to the following file:</p>
    <p><strong>{{fileName}}</strong></p>
    <p>You can access the file using the link below:</p>
    <a href="{{fileLink}}" class="button">View File</a>
    <p>If you have any questions or need assistance, feel free to contact us.</p>
    <p>Best regards,<br>Your Company Name</p>
    <div class="footer">
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const sendAccessEmail = async ({ email, fileLink }) => {
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

  const template = handlebars.compile(databaseAccessTemplate);

  const filledTemplate = template({ fileName: "database-claw", fileLink });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "Database Claw access granted",
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
                  <p>A new contact us query has been submitted from ${contactDetails.from}. Below are the details:</p>
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
  sendAccessEmail,
};
