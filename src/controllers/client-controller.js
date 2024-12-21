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
} = require("../utils/common/sendEmail");
const sessionCleanup = require("../utils/common/sessionHelper");
const { default: mongoose } = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const { Client } = require("../models");
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
      await GptServices.createGptUser(phoneNumber, client.id);

      const adiraPlan = await prisma.userAdiraPlan.findFirst({
        where: {
          userId: client.id,
        },
        include: {
          plan: true,
        },
      });

      const data = {
        verified: client.verified,
        ambassador: client.ambassador ? true : false,
        registered: false,
        newGptUser: true,
        newClient: true,
        sessions: 1,
        mongoId: client.id,
        stateLocation: "",
        adiraPlan,
        totalUsed: 0,
      };

      if (verified) {
        data.jwt = jwt;
        data.expiresAt = expiresAt;
      }

      // console.log(data);

      const successResponse = SuccessResponse(data);
      return res.status(StatusCodes.CREATED).json(successResponse);
    }

    const plan = await GptServices.getUserPlan(existing.id); // it can be open
    console.log(plan.length);
    console.log(new Date());

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
        0
      );

      console.log("plan created");
    }

    // fetch updated client
    const updatedClient = await ClientService.updateClient(existing.id, {
      verified,
    });
    console.log(updatedClient.id, existing.id);

    // const existingPlan = await prisma.newUserPlan.findMany({
    //   where: {
    //     userId: existing.id,
    //   },
    //   include: {
    //     plan: true,
    //   },
    // });

    // let maxSession = 0;

    // if (existingPlan.length == 0) {
    //   maxSession = 1;
    // } else {
    //   existingPlan.forEach((plan) => {
    //     maxSession = Math.max(maxSession, plan?.plan?.session);
    //   });
    // }

    // // console.log(JSON.stringify(existingPlan));
    // // console.log(existingPlan);

    // // Clean up old/inactive sessions
    // await sessionCleanup(existing);
    // console.log("proceeding to");

    // // If active sessions have reached the limit, logout all users
    // if (existing.sessions.length >= maxSession) {
    //   existing.sessions = []; // Clear all sessions
    //   await existing.save();
    //   // return res
    //   //   .status(403)
    //   //   .send("All users have been logged out. Please log in again.");
    // }

    // // Create new JWT and session ID
    // const sessionId = new mongoose.Types.ObjectId().toString();

    // create jwt
    const { jwt, expiresAt } = createToken({
      id: updatedClient.id,
      phoneNumber,
      // sessionId,
    });

    // Add the new session to activeSessions array
    // existing.sessions.push({ sessionId });
    await existing.save();

    // console.log(jwt, expiresAt);
    // check if new gpt user
    const existingGptUser = await fetchGptUser(existing.id);
    // if (!existingGptUser)
    //   await GptServices.createGptUser(phoneNumber, existing.id);

    const sessions = await GptServices.incrementNumberOfSessions(
      updatedClient.id,
      1
    );

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

    const adiraPlan = await prisma.userAdiraPlan.findFirst({
      where: {
        userId: updatedClient.id,
      },
      include: {
        plan: true,
      },
    });

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
      adiraPlan,
      // gptPlan,
      totalUsed: updatedClient.totalUsed,
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
    // const existing = req.user;
    // console.log(existing);
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

    const plan = await GptServices.getUserPlan(existing.id); // it can be open
    console.log(plan.length);
    console.log(new Date());

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
        0
      );

      console.log("plan created");
    }

    // fetch updated client
    const updatedClient = await ClientService.updateClient(existing.id, {
      verified: true,
    });
    console.log(updatedClient.id, existing.id);

    // const existingPlan = await prisma.newUserPlan.findMany({
    //   where: {
    //     userId: existing.id,
    //   },
    //   include: {
    //     plan: true,
    //   },
    // });

    // let maxSession = 0;

    // if (existingPlan.length == 0) {
    //   maxSession = 1;
    // } else {
    //   existingPlan.forEach((plan) => {
    //     maxSession = Math.max(maxSession, plan?.plan?.session);
    //   });
    // }

    // // console.log(JSON.stringify(existingPlan));
    // // console.log(existingPlan);

    // // Clean up old/inactive sessions
    // await sessionCleanup(existing);

    // // If active sessions have reached the limit, logout all users
    // if (existing.sessions.length >= maxSession) {
    //   existing.sessions = []; // Clear all sessions
    //   await existing.save();
    //   // return res
    //   //   .status(403)
    //   //   .send("All users have been logged out. Please log in again.");
    // }

    // // Create new JWT and session ID
    // const sessionId = new mongoose.Types.ObjectId().toString();

    // create jwt
    const { jwt, expiresAt } = createToken({
      id: updatedClient.id,
      phoneNumber: existing.phoneNumber,
      // sessionId,
    });

    // // Add the new session to activeSessions array
    // existing.sessions.push({ sessionId });
    await existing.save();

    // console.log(jwt, expiresAt);
    // check if new gpt user
    const existingGptUser = await fetchGptUser(existing.id);
    if (!existingGptUser)
      await GptServices.createGptUser(phoneNumber, existing.id);

    const sessions = await GptServices.incrementNumberOfSessions(
      updatedClient.id,
      1
    );

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

    const adiraPlan = await prisma.userAdiraPlan.findFirst({
      where: {
        userId: updatedClient.id,
      },
      include: {
        plan: true,
      },
    });

    const successResponse = {
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
      adiraPlan,
      // gptPlan,
      totalUsed: updatedClient.totalUsed,
    };

    // if (process.env.NODE_ENV === "production") {
    //   console.log("this is a production");
    //   res.redirect(
    //     `https://clawlaw-dev.netlify.app/?userDetails=${successResponse}`
    //   );
    // } else {
    //   console.log("this is a development");

    //   res.redirect(`http://localhost:3001/?userDetails=${successResponse}`);
    // }

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
};
