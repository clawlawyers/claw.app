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

  const info = await transporter.sendMail(mailOptions);

  // console.log(info);
};

module.exports = {
  sendConfirmationEmail,
};
