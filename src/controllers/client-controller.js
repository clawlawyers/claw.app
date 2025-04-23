const { ClientService, GptServices } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const { uploadFile } = require("../services/s3-service");
const { AWS_S3_BUCKET_NAME, AWS_REGION } = require("../config/server-config");
const { createToken } = require("../utils/common/auth");
const prisma = require("../config/prisma-client");
const { fetchGptUser } = require("../services/gpt-service");
const {
  sendConfirmationEmailForAmbasForFreePlan,
  sendConfirmationEmailForAdminConfirmation,
  sendConfirmationEmailForUserConfirmation,
} = require("../utils/common/sendEmail");
const sessionCleanup = require("../utils/common/sessionHelper");
const { default: mongoose } = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const { Client } = require("../models");
const LegalAutomation = require("../models/legalAutomationForm");
require("../services/passport");

/**
 * POST:  client/signup
 * req.body {email: 'client@gmail.com', password: "dsfj9sdjfoijw09"}
 **/
async function createClient(req, res) {
  try {
    const response = await ClientService.createClient({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function signin(req, res) {
  try {
    const response = await ClientService.signin({
      username: req.body.username,
      password: req.body.password,
    });
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function authMe(req, res) {
  try {
    const response = req.body.client;
    const successResponse = SuccessResponse(response);
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    return res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function getClientById(req, res) {
  try {
    const response = await ClientService.getClient(req.query.id);
    SuccessResponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function verify(req, res) {
  try {
    const { phoneNumber, verified } = req.body;
    console.log(req.body);
    const existing = await ClientService.getClientByPhoneNumber(phoneNumber);

    console.log(existing);

    // new client
    if (!existing) {
      const { firstName, lastName, email, profession, industry, purpose } =
        req.body;
      console.log(firstName, lastName, email, profession, industry, purpose);
      // create new client
      const { client, jwt, expiresAt } = await ClientService.createClient({
        phoneNumber,
        verified,
        firstName,
        lastName,
        email,
        profession,
        industry,
        purpose,
      });

      console.log(client.id);

      // create new corresponding gpt user
      const createdUser = await GptServices.createGptUser(
        phoneNumber,
        client.id
      );

      let adiraPlan;

      if (createdUser.currencyType == "INR") {
        adiraPlan = await prisma.userAllPlan.findFirst({
          where: {
            userId: client.id,
          },
          include: {
            plan: true,
          },
        });
      }

      if (createdUser.currencyType == "USD") {
        adiraPlan = await prisma.userAllUSPlan.findFirst({
          where: {
            userId: client.id,
          },
          include: {
            plan: true,
          },
        });
      }

      if (createdUser.currencyType == "GBP") {
        adiraPlan = await prisma.userAllUKPlan.findFirst({
          where: {
            userId: client.id,
          },
          include: {
            plan: true,
          },
        });
      }

      const data = {
        verified: client.verified,
        ambassador: client.ambassador ? true : false,
        registered: false,
        newGptUser: true,
        newClient: true,
        sessions: 1,
        mongoId: client.id,
        stateLocation: "",
        currentPlan: adiraPlan,
        totalUsed: 0,
        email: email,
        currencyType: createdUser.currencyType,
      };

      if (verified) {
        data.jwt = jwt;
        data.expiresAt = expiresAt;
      }

      // console.log(data);

      const successResponse = SuccessResponse(data);
      return res.status(StatusCodes.CREATED).json(successResponse);
    }

    // fetch updated client
    const updatedClient = await ClientService.updateClient(existing.id, {
      verified,
    });

    const sessions = await GptServices.incrementNumberOfSessions(
      updatedClient.id,
      1
    );

    const plan = await GptServices.getUserPlan(
      existing.id,
      sessions.currencyType
    );

    // This free plan only for some occasionally

    if (plan.length === 0) {
      console.log("user do not have any plan. plan will be creating");

      const createAt = new Date();
      // const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await GptServices.updateUserAdiraPlan(
        existing.id,
        "FREE",
        "15 MINUTES TRIAL",
        "",
        createAt,
        null,
        "",
        null,
        0,
        sessions.currencyType
      );

      console.log("plan created");
    }

    // create jwt
    const { jwt, expiresAt } = createToken({
      id: updatedClient.id,
      phoneNumber,
      // sessionId,
    });

    await existing.save();

    // check if new gpt user
    const existingGptUser = await fetchGptUser(existing.id);

    const gtpUserGuy = await prisma.user.findFirst({
      where: {
        mongoId: updatedClient.id,
      },
    });

    if (gtpUserGuy.isambassadorBenifined === false) {
      const createAt = new Date();
      const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      await GptServices.updateIsAmbassadorBenifined(updatedClient.id, true);
      await GptServices.updateUserPlan(
        updatedClient.id,
        "FREE_M",
        "ambassador",
        "",
        createAt,
        null,
        "",
        expiresAt,
        0
      );

      const username = existing?.firstName;
      const email = existing?.email;

      await sendConfirmationEmailForAmbasForFreePlan(email, username);
    }

    let adiraPlan;

    if (sessions.currencyType === "INR") {
      adiraPlan = await prisma.userAllPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    if (sessions.currencyType === "USD") {
      adiraPlan = await prisma.userAllUSPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    if (sessions.currencyType === "GBP") {
      adiraPlan = await prisma.userAllUKPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    const successResponse = SuccessResponse({
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
      currentPlan: adiraPlan,
      phoneNumber: existingGptUser.phoneNumber,
      totalUsed: updatedClient.totalUsed,
      email: existing.email,
      currencyType: sessions.currencyType,
    });

    // console.log(successResponse);
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function googleAuthCallbackTemp(req, res) {
  const { token } = req.body; // The token sent from the frontend

  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  try {
    // Verify the Google ID token using Google's OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENTID, // Your Google OAuth 2.0 Client ID
    });

    const payload = ticket.getPayload(); // Get user info from the token

    const email = payload.email;
    const googleId = payload.sub; // This is the unique ID from Google

    // Check if the user exists in your database
    let user = await Client.findOne({ email });

    if (!user) {
      // If the user doesn't exist, you can create a new user or redirect them
      // Example of creating a new user (You can customize as needed)
      user = new Client({
        googleAuthId: googleId,
        name: payload.name,
        email: payload.email,
        profilePicture: payload.picture, // Optional, if you want to store the profile picture
      });

      await user.save(); // Save new user to the database
    }

    // Generate a JWT token (Optional, if you want to use JWT for subsequent requests)
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response back to the frontend with the user data and JWT token
    res.status(200).json({
      message: "User authenticated successfully",
      user: {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture, // Optional
      },
      token: jwtToken, // Send JWT token if using JWT for authentication
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(400).json({ message: "Invalid token" });
  }
}

async function googleAuthCallback(req, res) {
  try {
    const { token } = req.body; // The token sent from the frontend

    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }
    const client = new OAuth2Client(process.env.CLIENTID);

    // Verify the Google ID token using OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENTID, // Your Google OAuth 2.0 Client ID
    });

    const payload = ticket.getPayload(); // Get user info from the token
    const email = payload.email;
    const googleId = payload.sub; // This is the unique ID from Google
    console.log(payload);

    // Check if the user exists in your database
    let existing = await Client.findOne({ email });

    // If a user is authenticated and found, proceed
    if (!existing) {
      // You can redirect them to a dashboard or any page
      return res.status(200).json({ message: "User not found" });
    }

    // fetch updated client
    const updatedClient = await ClientService.updateClient(existing.id, {
      verified: true,
    });

    const sessions = await GptServices.incrementNumberOfSessions(
      updatedClient.id,
      1
    );

    const plan = await GptServices.getUserPlan(
      existing.id,
      sessions.currencyType
    ); // it can be open

    // This free plan only for some occasionally

    if (plan.length === 0) {
      console.log("user do not have any plan. plan will be creating");

      const createAt = new Date();
      // const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await GptServices.updateUserAdiraPlan(
        existing.id,
        "FREE",
        "15 MINUTES TRIAL",
        "",
        createAt,
        null,
        "",
        null,
        0,
        sessions.currencyType
      );

      console.log("plan created");
    }

    // create jwt
    const { jwt, expiresAt } = createToken({
      id: updatedClient.id,
      phoneNumber: existing.phoneNumber,
      // sessionId,
    });

    // existing.sessions.push({ sessionId });
    await existing.save();

    // console.log(jwt, expiresAt);
    // check if new gpt user
    const existingGptUser = await fetchGptUser(existing.id);
    if (!existingGptUser)
      await GptServices.createGptUser(phoneNumber, existing.id);

    const gtpUserGuy = await prisma.user.findFirst({
      where: {
        mongoId: updatedClient.id,
      },
    });

    if (gtpUserGuy.isambassadorBenifined === false) {
      const createAt = new Date();
      const expiresAt = new Date(createAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      await GptServices.updateIsAmbassadorBenifined(updatedClient.id, true);
      await GptServices.updateUserPlan(
        updatedClient.id,
        "FREE_M",
        "ambassador",
        "",
        createAt,
        null,
        "",
        expiresAt,
        0
      );

      const username = existing?.firstName;
      const email = existing?.email;

      await sendConfirmationEmailForAmbasForFreePlan(email, username);
    }

    let adiraPlan;

    if (sessions.currencyType === "INR") {
      adiraPlan = await prisma.userAllPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    if (sessions.currencyType === "USD") {
      adiraPlan = await prisma.userAllUSPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    if (sessions.currencyType === "GBP") {
      adiraPlan = await prisma.userAllUKPlan.findFirst({
        where: {
          userId: updatedClient.id,
        },
        include: {
          plan: true,
        },
      });
    }

    const successResponse = {
      phoneNumber: existing.phoneNumber,
      newClient: false,
      verified: true,
      registered: updatedClient.registered,
      ambassador: updatedClient.ambassador ? true : false,
      jwt,
      expiresAt,
      newGptUser: existingGptUser ? false : true,
      sessions: sessions.numberOfSessions,
      mongoId: sessions.mongoId,
      stateLocation: sessions.StateLocation,
      currentPlan: adiraPlan,
      // gptPlan,
      phoneNumber: existingGptUser.phoneNumber,
      totalUsed: updatedClient.totalUsed,
      email: email,
      currencyType: sessions.currencyType,
    };

    return res.status(StatusCodes.OK).json(successResponse);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

async function setLocation(req, res) {
  try {
    const response = await GptServices.updateStateLocation(req.body.id, {
      location: req.body.location,
    });
    console.log(response);
    // const SuccessResponse = SuccessResponse(response);
    // SuccessResponse.data = response;
    console.log(SuccessResponse());
    return res.status(StatusCodes.OK).json(SuccessResponse());
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function createLeader(req, res) {
  try {
    const { phoneNumber, collegeName, firstName, lastName } = req.body;
    const existingUser = await ClientService.getClientByPhoneNumber(
      phoneNumber
    );

    if (!existingUser) {
      const newClient = await ClientService.createClient({
        phoneNumber,
        collegeName,
        firstName,
        lastName,
        ambassador: true,
      });
      return res.status(StatusCodes.CREATED).json(SuccessResponse(newClient));
    } else {
      const updatedClient = await ClientService.updateClient(existingUser.id, {
        collegeName,
        firstName,
        lastName,
        ambassador: true,
      });
      return res.status(StatusCodes.OK).json(SuccessResponse(updatedClient));
    }
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function register(req, res) {
  try {
    const { phoneNumber, ...rest } = req.body;
    const client = await ClientService.getClientByPhoneNumber(phoneNumber);
    if (!client)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(ErrorResponse({}, { message: "Invalid phone number" }));
    if (!client.verified)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse({}, { message: "Client not verified" }));
    if (client.registered)
      return res
        .status(StatusCodes.BAD_GATEWAY)
        .json(ErrorResponse({}, { message: "Client already registered" }));
    const updatedClient = await ClientService.updateClient(client.id, {
      ...rest,
      registered: true,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(updatedClient));
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

async function getAllClients(req, res) {
  try {
    const data = await ClientService.getAllClients();
    const successResponse = SuccessResponse(data);
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function legalAutomationForm(req, res) {
  try {
    const {
      name,
      email,
      phoneNumber,
      serviceInterested,
      firmOrIndividual,
      additionalInfo,
    } = req.body;
    const legalAutomation = new LegalAutomation({
      name,
      email,
      phoneNumber,
      serviceInterested,
      firmOrIndividual,
      additionalInfo,
    });
    await legalAutomation.save();

    const AlertData = {
      additional_info: additionalInfo,
      firm_or_individual: firmOrIndividual,
      services_interested: serviceInterested,
      phone_number: phoneNumber,
      email: email,
      name: name,
    };

    const userAlert = await sendConfirmationEmailForAdminConfirmation(
      AlertData
    );
    const adminAlert = await sendConfirmationEmailForUserConfirmation(
      email,
      AlertData
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Legal automation form submitted successfully",
      data: legalAutomation,
    });
  } catch (error) {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function validateUser(req, res) {
  try {
    const data = req.body;
    const isValid = await ClientService.validateUserService(data);

    if (!isValid) {
      return res.status(200).json({ message: "Invalid user credentials" });
    }
    return res.status(200).json({ message: "User is valid" });
  } catch (error) {
    console.error("Error while validating user:", error);
    res.status(500).json({
      error: "An error occurred while validating the user",
      details: error.message,
    });
  }
}

async function updateClient(req, res) {
  try {
    const { client, ...data } = req.body;
    const { id } = client;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      await uploadFile(req.file.buffer, `profilePic_client_${id}${ext}`);
      data.profilePicture = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/profilePic_client_${id}${ext}`;
    }

    const updatedClient = await ClientService.updateClient(id, data);
    const successResponse = SuccessResponse(updatedClient);
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  createClient,
  signin,
  getClientById,
  authMe,
  getAllClients,
  verify,
  updateClient,
  register,
  createLeader,
  setLocation,
  googleAuthCallback,
  googleAuthCallbackTemp,
  validateUser,
  legalAutomationForm,
};
