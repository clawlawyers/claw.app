const { ClientService, GptServices } = require(".");
const { createToken } = require("../utils/common/auth");
const { fetchGptUser } = require("./gpt-service");

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
