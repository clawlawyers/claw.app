const express = require("express");
const { ServerConfig, ConnectDB } = require("./src/config");
const apiRoutes = require("./src/routes");
const cors = require("cors");
const app = express();
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer();
const bodyParser = require("body-parser");
const cron = require("node-cron"); // Add this line
require("./src/config/prisma-client");
const { PrismaClient } = require("@prisma/client"); // Add this line
const { DbAutomationService } = require("./src/services");
const prisma = new PrismaClient(); // Add this line

app.use(
  express.json({
    verify: function (req, res, buf) {
      const url = req.url;
      console.log(url);
      if (url === "/api/v1/payment/webhook") {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// app.use((req, res, next) => {
//   const clientIp =
//     req.headers["x-forwarded-for"] || req.connection.remoteAddress;
//   const origin = req.headers.origin || req.headers.referer;

//   console.log("Client IP:", clientIp);
//   console.log("Origin:", origin);
//   console.log("Origin:", origin?.toString()?.substring(8));

//   next();
// });

app.use("/api", apiRoutes);

app.use("/verify", (req, res) => {
  const url = `http://localhost:3001` + req.originalUrl;
  proxy.web(req, res, { target: url });
});

app.use("/fetchHeadlines/*", (req, res) => {
  const url = `http://localhost:3001` + req.originalUrl;
  proxy.web(req, res, { target: url });
});

app.use("", (req, res) => {
  res.status(200).json({
    message: "Server is live.",
  });
});

// Schedule task to run every minute (for testing purposes)
cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task to handle expired plans");
  await DbAutomationService.handleExpiredPlans();
  await DbAutomationService.handleExpiredPlansUK();
  await DbAutomationService.handleExpiredPlansUS();
  await DbAutomationService.resetTotalUsedForAllClients();
});

// Call the function immediately to test it
(async () => {
  try {
    await DbAutomationService.handleExpiredPlans();
    // await DbAutomationService.activateTodaysNewUserPlans();
    // await DbAutomationService.deactivateExpiredUserPlans();
  } catch (error) {
    console.error("Error removing expired user plans:", error);
  }
})();

app.listen(ServerConfig.PORT, async () => {
  //mongoDB connection
  await ConnectDB();
  console.log(`Server is up at ${ServerConfig.PORT}`);
});
