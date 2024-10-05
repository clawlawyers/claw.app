const ClientAdiraUser = require("../models/cleintAdiraUser");

async function getClientByDomainName(Domain) {
  try {
    let userBooking;
    if (process.env.NODE_ENV === "production") {
      // Find existing booking for the current date and hour
      userBooking = await ClientAdiraUser.findOne({
        // Domain: "shubham.courtroom.clawlaw.in",
        Domain: Domain,
      });
    } else {
      // Find existing booking for the current date and hour
      userBooking = await ClientAdiraUser.findOne({
        Domain: "shubham.adira.clawlaw.in",
        // Domain: Domain,
      });
    }

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
