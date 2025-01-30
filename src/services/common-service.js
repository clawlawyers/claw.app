const { ClientService, GptServices } = require(".");
const { createToken } = require("../utils/common/auth");
const { fetchGptUser } = require("./gpt-service");

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { sendAccessEmail } = require("../utils/coutroom/sendEmail");

// Load the service account credentials
// const credentialsPath = path.join(__dirname, "credentials.json");

let auth;
if (process.env.NODE_ENV !== "production") {
  // Google Cloud Storage configuration

  // Load the service account credentials
  // const credentialsPath = path.join(__dirname, "credentials.json");

  auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname + "/credentials.json"), // Replace with your service account key file path,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
} else {
  // Google Cloud Storage configuration
  auth = new google.auth.GoogleAuth({
    keyFile: path.join("/etc/secrets/credentials.json"), // Replace with your service account key file path,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

const drive = google.drive({ version: "v3", auth });

exports.createNewUser = async (phoneNumber, verified) => {
  try {
    const existing = await ClientService.getClientByPhoneNumber(phoneNumber);

    // new client
    if (!existing) {
      // create new client
      const { client, jwt, expiresAt } = await ClientService.createClient({
        phoneNumber,
        verified,
      });

      console.log(client.id);

      // create new corresponding gpt user
      await GptServices.createGptUser(phoneNumber, client.id);
      const data = {
        verified: client.verified,
        ambassador: client.ambassador ? true : false,
        registered: false,
        newGptUser: true,
        newClient: true,
        sessions: 1,
        mongoId: client.id,
        stateLocation: "",
      };

      if (verified) {
        data.jwt = jwt;
        data.expiresAt = expiresAt;
      }

      // console.log(data);

      return data;
    }

    // fetch updated client
    const updatedClient = await ClientService.updateClient(existing.id, {
      verified,
    });
    console.log(updatedClient.id, existing.id);
    // create jwt
    const { jwt, expiresAt } = createToken({
      id: updatedClient.id,
      phoneNumber,
    });
    // console.log(jwt, expiresAt);
    // check if new gpt user
    const existingGptUser = await fetchGptUser(existing.id);
    if (!existingGptUser)
      await GptServices.createGptUser(phoneNumber, existing.id);

    const sessions = await GptServices.incrementNumberOfSessions(
      updatedClient.id,
      1
    );

    const successResponse = {
      newClient: false,
      verified: verified,
      registered: updatedClient.registered,
      ambassador: updatedClient.ambassador ? true : false,
      jwt,
      expiresAt,
      newGptUser: existingGptUser ? false : true,
      sessions: sessions.numberOfSessions,
      mongoId: sessions.mongoId,
      stateLocation: sessions.StateLocation,
    };

    return successResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.giveAccessOfDatabaseDrive = async (emailAddress) => {
  try {
    // Grant permission to the email address
    await drive.permissions.create({
      fileId: "1ACHBYO6LOxkkRXuGMc_KOUqT13_4LJqa",
      requestBody: {
        type: "user", // Share with a specific user
        role: "reader", // Role can be 'reader', 'commenter', or 'writer'
        emailAddress: emailAddress,
      },
      emailMessage:
        "You have been invited to access this folder. Please accept the invitation.",
    });

    console.log(`Invitation sent to ${emailAddress}.`);

    // Get the folder's shareable link
    const result = await drive.files.get({
      fileId: "1ACHBYO6LOxkkRXuGMc_KOUqT13_4LJqa",
      fields: "webViewLink",
    });

    await sendAccessEmail({
      email: emailAddress,
      fileLink: result.data.webViewLink,
    });

    console.log("Folder is accessible at:", result.data.webViewLink);

    return result.data.webViewLink;
  } catch (error) {
    console.error("Error sharing folder:", error.message);
  }
};
