const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

module.exports = {
  MONGOURI: process.env.MONGOURI,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
  EXPIRES_IN: process.env.EXPIRES_IN,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  id: process.env.id,
  OPEN_API_KEY: process.env.OPEN_API_KEY,
  MEDIA_STACK_ACCESS_KEY: process.env.MEDIA_STACK_ACCESS_KEY,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET,
  CASHFREE_URL: process.env.CASHFREE_URL,
  RAZORPAY_ID: process.env.RAZORPAY_ID,
  RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  CLAW_EMAIL: process.env.CLAW_EMAIL,
  CLAW_PASS: process.env.CLAW_PASS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
