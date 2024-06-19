const express = require("express");
const { ServerConfig, ConnectDB } = require("./src/config");
const apiRoutes = require("./src/routes");
const cors = require("cors");
const app = express();
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer();
const bodyParser = require("body-parser");
require("./src/config/prisma-client");

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
  res.header("Access-Control-Allow-Origin", "https://clawlaw-dev.netlify.app"); // Adjust this as necessary
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

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

app.listen(ServerConfig.PORT, async () => {
  //mongoDB connection
  await ConnectDB();
  console.log(`Server is up at ${ServerConfig.PORT}`);
});
