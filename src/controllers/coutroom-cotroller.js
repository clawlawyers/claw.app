const { hashPassword } = require("../utils/coutroom/auth");
const { sendConfirmationEmail } = require("../utils/coutroom/sendEmail");
const { CourtroomService } = require("../services");

async function bookCourtRoom(req, res) {
  try {
    const { name, phoneNumber, email, password, slots, recording } = req.body;

    // Check if required fields are provided
    if (
      !name ||
      !phoneNumber ||
      !email ||
      !password ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      return res.status(400).send("Missing required fields.");
    }

    const hashedPassword = await hashPassword(password);

    for (const slot of slots) {
      const { date, hour } = slot;
      if (!date || hour === undefined) {
        return res.status(400).send("Missing required fields in slot.");
      }

      const bookingDate = new Date(date);

      const respo = await CourtroomService.courtRoomBook(
        name,
        phoneNumber,
        email,
        hashedPassword,
        bookingDate,
        hour,
        recording
      );

      if (respo) {
        return res.status(400).send(respo);
      }
    }
    await sendConfirmationEmail(email);

    res.status(201).send("Courtroom slots booked successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
}

async function getBookedData(req, res) {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const bookings = await CourtroomService.getBookedData(lastMonth);

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
}

async function loginToCourtRoom(req, res) {
  const { phoneNumber, password } = req.body;
  try {
    if (!phoneNumber || !password) {
      return res.status(400).send("Missing required fields.");
    }
    const response = await CourtroomService.loginToCourtRoom(
      phoneNumber,
      password
    );
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
}

module.exports = {
  bookCourtRoom,
  getBookedData,
  loginToCourtRoom,
};
