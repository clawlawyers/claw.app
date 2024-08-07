const express = require("express");
const UserRoutes = require("./user-routes");
const ClientRoutes = require("./client-routes");
const courtroomRoutes = require("./courtroom-routes");
const PostRoutes = require("./post-routes");
const GigRoutes = require("./gig-routes");
const GptRoutes = require("./gpt-routes");
const LeadRoutes = require("./lead-routes");
const BaseRoutes = require("./base-routes");
const BlogsRoutes = require("./blog-routes");
const MailingListRoutes = require("./mailingList-routes");
const CaseFinderRoutes = require("./case-routes");
// const PaymentRoutes = require("./payment-routes");
const AdminRoute = require("./admin-routes");
const CronRoutes = require("./cron-routes");
const Salesman = require("./salesman");
const Razorpay = require("./razorpay-routes");
const BookingPayment = require("./bookingPayment-routes");
const router = express.Router();

router.use("/user", UserRoutes);
router.use("/client", ClientRoutes);
router.use("/post", PostRoutes);
router.use("/lead", LeadRoutes);
router.use("/", BaseRoutes);
router.use("/gig", GigRoutes);
router.use("/gpt", GptRoutes);
router.use("/blog", BlogsRoutes);
router.use("/mailinglist", MailingListRoutes);
router.use("/case", CaseFinderRoutes);
// router.use("/payment", PaymentRoutes);
router.use("/payment", Razorpay);
router.use("/booking-payment", BookingPayment);
router.use("/admin", AdminRoute);
router.use("/cron", CronRoutes);
router.use("/salesman", Salesman);
router.use("/courtroom", courtroomRoutes);

module.exports = router;
