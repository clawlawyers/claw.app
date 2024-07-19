const nodemailer = require("nodemailer");
const {
  MAIL_HOST,
  MAIL_USER,
  MAIL_PASS,
} = require("../../config/server-config");

// Function to send confirmation email
const sendConfirmationEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: MAIL_USER, // Replace with your email
      pass: MAIL_PASS, // Replace with your email password
    },
  });

  const mailOptions = {
    from: "claw enterprise",
    to: email,
    subject: "Courtroom Booking Confirmation",
    html: "<h1>Your courtroom booking has been confirmed.</h1>",
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
