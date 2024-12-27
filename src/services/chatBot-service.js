const CHATBOT_ENDPOINT = process.env.CHATBOT_ENDPOINT;

async function getUserId() {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`${CHATBOT_ENDPOINT}/user_id`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting user ID");
  }
}

async function chatUser(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CHATBOT_ENDPOINT}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting user details");
  }
}

async function contactUs(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CHATBOT_ENDPOINT}/contact_us`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error("Error contacting us");
  }
}

async function endSession(body) {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`${CHATBOT_ENDPOINT}/clear`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message from the response
      throw new Error(`message: ${errorText}`);
    }
    return response.ok;
  } catch (error) {
    console.error(error);
    throw new Error("Error ending session");
  }
}

module.exports = {
  getUserId,
  chatUser,
  contactUs,
  endSession,
};
