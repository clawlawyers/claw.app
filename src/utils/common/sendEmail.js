const nodemailer = require("nodemailer");
const {
  MAIL_HOST,
  MAIL_USER,
  MAIL_PASS,
  CLAW_EMAIL,
  CLAW_PASS,
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
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Ambassador Welcome Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        max-width: 100%;
        /* margin: 0 auto; */
        background-color: #ffffff;
        /* padding: 20px; */
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        width: 100%;
        text-align: center;
        /* background-color: #4caf50; */
        /* padding: 20px; */
        border-radius: 10px 10px 0 0;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
      }
      .header img {
        width: 100%;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333333;
      }
      .content p {
        color: #666666;
        line-height: 1.5;
      }
      .cta-button {
        display: inline-block;
        background-color: rgb(0, 67, 67);
        color: white;
        text-decoration: none;
        padding: 15px 25px;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
      .footer {
        width: 100%;
        text-align: center;
        color: #999999;
        font-size: 12px;
      }
      .footer a {
        color: #4caf50;
        text-decoration: none;
      }
      .footer img {
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://clawlaw-dev.netlify.app/welcome_h.png" />
      </div>
      <div class="content">
        <h2>Hi {{AmbassadorName}},</h2>
        <p>
          We're thrilled to have you as an ambassador for
          <strong>clawlaw.in</strong>! 🎉
        </p>
        <p>
          As a special thank you for joining us, we've unlocked
          <strong>1 month of free access</strong> to all our premium features
          just for you!
        </p>
        <p>
          To start enjoying your free access, click the button below to visit
          your dashboard:
        </p>
        <a href="https://www.clawlaw.in/leaders/dashboard" class="cta-button"
          >Go to Dashboard</a
        >
        <p>
          Thank you for being a part of our community. We’re excited to see the
          amazing things you'll accomplish as our Ambassador!
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2024 CLAW LEGALTECH PRIVATE LIMITED. All rights reserved.</p>
        <img src="https://clawlaw-dev.netlify.app/welcome_f.png" />
      </div>
    </div>
  </body>
</html>


`;

const template = handlebars.compile(htmlTemplate);

// Function to send confirmation email
const sendConfirmationEmailForAmbas = async (email, username) => {
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
    AmbassadorName: username,
  });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "Ambassador Welcome Email",
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

const htmlTemplateForPlan = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Ambassador Welcome Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        max-width: 100%;
        /* margin: 0 auto; */
        background-color: #ffffff;
        /* padding: 20px; */
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        width: 100%;
        text-align: center;
        /* background-color: #4caf50; */
        /* padding: 20px; */
        border-radius: 10px 10px 0 0;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
      }
      .header img {
        width: 100%;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333333;
      }
      .content p {
        color: #666666;
        line-height: 1.5;
      }
      .cta-button {
        display: inline-block;
        background-color: rgb(0, 67, 67);
        color: white;
        text-decoration: none;
        padding: 15px 25px;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
      .footer {
        width: 100%;
        text-align: center;
        color: #999999;
        font-size: 12px;
      }
      .footer a {
        color: #4caf50;
        text-decoration: none;
      }
      .footer img {
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://clawlaw-dev.netlify.app/access_h.png" />
      </div>
      <div class="content">
        <h2>You've Received 1 Month of Free Access!</h2>
        <p>Hi {{AmbassadorName}},</p>
        <p>
          We are excited to inform you that you have been granted
          <strong>1 month of free access</strong> to all our premium features at
          <strong>clawlaw.in</strong>! 🎉
        </p>
        <p>
          Make sure to visit your dashboard to explore all the amazing tools and
          resources we have in store for you.
        </p>
        <a href="https://www.clawlaw.in/leaders/dashboard" class="cta-button"
          >Go to Dashboard</a
        >
        <p>
          Thank you for being a valued ambassador. We look forward to supporting
          your journey!
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2024 CLAW LEGALTECH PRIVATE LIMITED. All rights reserved.</p>
        <img src="https://clawlaw-dev.netlify.app/access_f.png" />
      </div>
    </div>
  </body>
</html>

`;

const templateForPlan = handlebars.compile(htmlTemplateForPlan);

const sendConfirmationEmailForAmbasForFreePlan = async (email, username) => {
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

  const filledTemplate = templateForPlan({
    AmbassadorName: username,
  });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "Ambassador Welcome Email",
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

const htmlTemplateForUserConfirmation = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>You're In! Legal Alerts Are Coming Your Way</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      "
    >
      <h2 style="color: #333333">
        🎉 You’re In! Legal Alerts Are Coming Your Way
      </h2>
      <p style="font-size: 16px; color: #555555">
        Hey
      </p>

      <p style="font-size: 16px; color: #555555">
        Welcome to the smarter side of law practice ⚖<br />
        You just made a sharp move by signing up for our
        <strong>Legal Alerts & Automation Services</strong>. Sit back and
        relax—we’ll keep your cases on track while you focus on winning them.
      </p>

      <h3 style="color: #333333">Here’s what we’ve received from you:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px">
        <tr style="background-color: #f0f0f0">
          <th style="text-align: left; padding: 10px; border: 1px solid #ddd">
            Field
          </th>
          <th style="text-align: left; padding: 10px; border: 1px solid #ddd">
            Details
          </th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd">{{email}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Phone Number</td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{phone_number}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Services Interested In
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{services_interested}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Firm / Individual
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{firm_or_individual}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Additional Information
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{additional_info}}
          </td>
        </tr>
      </table>

      <p style="font-size: 16px; color: #555555; margin-top: 20px">
        👨‍💻 Our team will get in touch shortly to help you get started.<br />
        Meanwhile, if you have questions, feel free to reach out to us at
        <a
          href="mailto:contact@clawlaw.in"
          style="color: #007bff; text-decoration: none"
          >contact@clawlaw.in</a
        >
        or call us at <strong>+91 63523 21550</strong>.
      </p>

      <p style="font-size: 16px; color: #333333; margin-top: 30px">
        Welcome aboard,<br />
        <strong>Team Claw Legal Tech</strong>
      </p>
    </div>
  </body>
</html>



`;

const templateForUserConfirmation = handlebars.compile(
  htmlTemplateForUserConfirmation
);

const sendConfirmationEmailForUserConfirmation = async (email, data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    logger: true,
    debug: true,
    secureConnection: true,
    auth: {
      user: CLAW_EMAIL, // Replace with your email
      pass: CLAW_PASS, // Replace with your email password
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const filledTemplate = templateForUserConfirmation({
    additional_info: data.additional_info,
    firm_or_individual: data.firm_or_individual,
    services_interested: data.services_interested,
    phone_number: data.phone_number,
    email: data.email,
    name: data.name,
  });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "🎉 You’re In! Legal Alerts Are Coming Your Way",
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

const htmlTemplateForAdminConfirmation = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>You're In! Legal Alerts Are Coming Your Way</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      margin: 0;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      "
    >
      <h2 style="color: #333333">
        🎉 You’re In! Legal Alerts Are Coming Your Way
      </h2>
      <p style="font-size: 16px; color: #555555">
        Hey
      </p>

      <p style="font-size: 16px; color: #555555">
        Welcome to the smarter side of law practice ⚖<br />
        You just made a sharp move by signing up for our
        <strong>Legal Alerts & Automation Services</strong>. Sit back and
        relax—we’ll keep your cases on track while you focus on winning them.
      </p>

      <h3 style="color: #333333">Here’s what we’ve received from you:</h3>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px">
        <tr style="background-color: #f0f0f0">
          <th style="text-align: left; padding: 10px; border: 1px solid #ddd">
            Field
          </th>
          <th style="text-align: left; padding: 10px; border: 1px solid #ddd">
            Details
          </th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd">{{email}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">Phone Number</td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{phone_number}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Services Interested In
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{services_interested}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Firm / Individual
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{firm_or_individual}}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd">
            Additional Information
          </td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{additional_info}}
          </td>
        </tr>
      </table>

      <p style="font-size: 16px; color: #555555; margin-top: 20px">
        👨‍💻 Our team will get in touch shortly to help you get started.<br />
        Meanwhile, if you have questions, feel free to reach out to us at
        <a
          href="mailto:contact@clawlaw.in"
          style="color: #007bff; text-decoration: none"
          >contact@clawlaw.in</a
        >
        or call us at <strong>+91 63523 21550</strong>.
      </p>

      <p style="font-size: 16px; color: #333333; margin-top: 30px">
        Welcome aboard,<br />
        <strong>Team Claw Legal Tech</strong>
      </p>
    </div>
  </body>
</html>



`;

const templateForAdminConfirmation = handlebars.compile(
  htmlTemplateForAdminConfirmation
);

const sendConfirmationEmailForAdminConfirmation = async (data) => {
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

  const filledTemplate = templateForAdminConfirmation({
    additional_info: data.additional_info,
    firm_or_individual: data.firm_or_individual,
    services_interested: data.services_interested,
    phone_number: data.phone_number,
    email: data.email,
    name: data.name,
  });

  const mailOptions = {
    from: "claw enterprise",
    to: "claw.lawyers@gmail.com",
    subject:
      "New Contact Us Query Received :- via Legal Alerts & Automation Services",
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
  sendConfirmationEmailForAmbas,
  sendAdminContactUsNotification,
  sendConfirmationEmailForAmbasForFreePlan,
  sendConfirmationEmailForUserConfirmation,
  sendConfirmationEmailForAdminConfirmation,
};
