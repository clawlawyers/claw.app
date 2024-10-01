const ClientAdiraUser = require("../models/cleintAdiraUser");

async function getClientByDomainName(Domain) {
  try {
    // Find existing booking for the current date and hour
    const userBooking = await ClientAdiraUser.findOne({
      // Domain: "shubham.courtroom.clawlaw.in",
      Domain: Domain,
    });

    // console.log(userBooking);
    if (!userBooking) {
      return "No bookings found for the current time slot.";
    }

    // console.log(userBooking);

    return { userBooking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  getClientByDomainName,
};
