const express = require("express");
const { SuccessResponse, ErrorResponse } = require("../../utils/common");
const { fetchNews } = require("../../scripts/newsapi");
const { StatusCodes } = require("http-status-codes");
const router = express.Router();
const { GptServices, ClientService } = require("../../services");
const mongoose = require("mongoose");

router.post("/news", async (req, res) => {
  try {
    await fetchNews(0);
    await fetchNews(1);
    return res.sendStatus(StatusCodes.OK);
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
});

let inMemoryEngagementData = {};
let AdirainMemoryEngagementData = {};
let WarroominMemoryEngagementData = {};

const  flushInMemoryDataToDatabase = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(AdirainMemoryEngagementData)



  try {
    for (const phoneNumber in inMemoryEngagementData) {
      const userEngagement = inMemoryEngagementData[phoneNumber];
      console.log(userEngagement)

      

      // console.log(phoneNumber);

      // Find the user by phone number
      const user = await ClientService.getClientByPhoneNumberWithSession(
        phoneNumber,
        session
      );

      //   console.log(user);

      if (user) {
        if (!user.engagementTime) {
          user.engagementTime = {
            daily: {},
            monthly: {},
            yearly: {},
            total: 0,
          };
        }
       

        // console.log(user.engagementTime);

        // Increment total engagement time
        const totalEngagementTime = Object.values(userEngagement.daily).reduce(
          (sum, time) => sum + time,
          0
        );
        user.engagementTime.total += totalEngagementTime;

        // Increment daily engagement time
        for (const [day, time] of Object.entries(userEngagement.daily)) {
          const dailyIncrement = time / 60; // Convert seconds to minutes
          const dailyDate = [...user?.engagementTime?.daily?.keys()][0];
          if (dailyDate === day) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`engagementTime.daily.${day}`]: dailyIncrement,
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$inc': { 'engagementTime.daily.${day}': ${dailyIncrement} } }`
            // );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`engagementTime.daily`]: { [`${day}`]: dailyIncrement },
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$set': { 'engagementTime.daily.${day}': ${dailyIncrement} } }`
            // );
          }
        }

        // Increment monthly engagement time
        for (const [month, time] of Object.entries(userEngagement.monthly)) {
          const monthlyIncrement = time / 3600; // Convert seconds to hours
          const monthlyDate = [...user?.engagementTime?.monthly?.keys()][0];
          if (monthlyDate === month) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`engagementTime.monthly.${month}`]: monthlyIncrement,
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$inc': { 'engagementTime.monthly.${month}': ${monthlyIncrement} } }`
            // );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`engagementTime.monthly`]: {
                    [`${month}`]: monthlyIncrement,
                  },
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$set': { 'engagementTime.monthly.${month}': ${monthlyIncrement} } }`
            // );
          }
        }

        // Increment yearly engagement time
        for (const [year, time] of Object.entries(userEngagement.yearly)) {
          const yearlyIncrement = time / 3600; // Convert seconds to hours
          const yearlyDate = [...user?.engagementTime?.yearly?.keys()][0];
          if (yearlyDate === year) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`engagementTime.yearly.${year}`]: yearlyIncrement,
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$inc': { 'engagementTime.yearly.${year}': ${yearlyIncrement} } }`
            // );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`engagementTime.yearly`]: {
                    [`${year}`]: yearlyIncrement,
                  },
                },
              },
              session
            );
            // console.log(
            //   `${phoneNumber} { '$set': { 'engagementTime.yearly.${year}': ${yearlyIncrement} } }`
            // );
          }
        }

        await ClientService.updateClientByPhoneNumberWithSession(
          phoneNumber,
          {
            $inc: {
              "engagementTime.total": totalEngagementTime / 60,
            },
          },
          session
        );

        // Log the total engagement time
        // console.log(
        //   `${phoneNumber} { '$inc': { 'engagementTime.total': ${
        //     totalEngagementTime / 60
        //   } } }`
        // );
      } else {
        console.log(`User not found for phone number: ${phoneNumber}`);
      }
    }
    for (const phoneNumber in AdirainMemoryEngagementData) {
      const userEngagement = AdirainMemoryEngagementData[phoneNumber];

      const user = await ClientService.getClientByPhoneNumberWithSession(
        phoneNumber,
        session
      );

      if (user) {  
        if (!user.spcificEngagementTime) {
          user.spcificEngagementTime = {
            Adira:{
              daily: {},
              monthly: {},
              yearly: {},
              total: 0,
              lastPage:""
            },
            Warroom:{
              daily: {},
              monthly: {},
              yearly: {},
              total: 0,
              lastPage:""
            }
          };
        }
        const totalEngagementTime = Object.values(userEngagement.daily).reduce(
          (sum, time) => sum + time,
          0
        );
        user.spcificEngagementTime.Adira.total += totalEngagementTime;
        console.log(userEngagement.lastPage)
        console.log("lastpage")
        await ClientService.updateClientByPhoneNumberWithSession(
          phoneNumber,
          { $set:{

          
              [`spcificEngagementTime.Adira.lastPage`]: userEngagement.lastPage ,
            
          }
          },
          session
        );

        for (const [day, time] of Object.entries(userEngagement.daily)) {
          const dailyIncrement = time / 60; // Convert seconds to minutes
          const dailyDate = [...user?.spcificEngagementTime?.Adira?.daily?.keys()][0];
          if (dailyDate === day) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              { $set:{

                $inc: {
                  [`spcificEngagementTime.Adira.daily.${day}`]: dailyIncrement,
                },
              }
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Adira.daily`]: { [`${day}`]: dailyIncrement },
                },
              },
              session
            );
          }
        }
        for (const [month, time] of Object.entries(userEngagement.monthly)) {
          const monthlyIncrement = time / 3600; // Convert seconds to hours
          const monthlyDate = [...user?.spcificEngagementTime?.Adira?.monthly?.keys()][0];
          if (monthlyDate === month) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`spcificEngagementTime.Adira.monthly.${month}`]: monthlyIncrement,
                },
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Adira.monthly`]: {
                    [`${month}`]: monthlyIncrement,
                  },
                },
              },
              session
            );
          }
        }

        for (const [year, time] of Object.entries(userEngagement.yearly)) {
          const yearlyIncrement = time / 3600; // Convert seconds to hours
          const yearlyDate = [...user?.spcificEngagementTime?.Adira?.yearly?.keys()][0];
          if (yearlyDate === year) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`spcificEngagementTime.Adira.yearly.${year}`]: yearlyIncrement,
                },
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Adira.yearly`]: {
                    [`${year}`]: yearlyIncrement,
                  },
                },
              },
              session
            );
          }
        }

        await ClientService.updateClientByPhoneNumberWithSession(
          phoneNumber,
          {
            $inc: {
              "spcificEngagementTime.Adira.total": totalEngagementTime / 60,
            },
          },
          session
        );
      } else {
        console.log(`User not found for phone number: ${phoneNumber}`);
      }
    }
    for (const phoneNumber in WarroominMemoryEngagementData) {
      const userEngagement = WarroominMemoryEngagementData[phoneNumber];

      const user = await ClientService.getClientByPhoneNumberWithSession(
        phoneNumber,
        session
      );

      if (user) {  
        if (!user.spcificEngagementTime) {
          user.spcificEngagementTime = {
            Adira:{
              daily: {},
              monthly: {},
              yearly: {},
              total: 0,
            },
            Warroom:{
              daily: {},
              monthly: {},
              yearly: {},
              total: 0,
            }
          };
        }
        const totalEngagementTime = Object.values(userEngagement.daily).reduce(
          (sum, time) => sum + time,
          0
        );
        user.spcificEngagementTime.Warroom.total += totalEngagementTime;

        for (const [day, time] of Object.entries(userEngagement.daily)) {
          const dailyIncrement = time / 60; // Convert seconds to minutes
          const dailyDate = [...user?.spcificEngagementTime?.Warroom?.daily?.keys()][0];
          if (dailyDate === day) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              { $set:{

                $inc: {
                  [`spcificEngagementTime.Warroom.daily.${day}`]: dailyIncrement,
                },
              }
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Warroom.daily`]: { [`${day}`]: dailyIncrement },
                },
              },
              session
            );
          }
        }
        for (const [month, time] of Object.entries(userEngagement.monthly)) {
          const monthlyIncrement = time / 3600; // Convert seconds to hours
          const monthlyDate = [...user?.spcificEngagementTime?.Warroom?.monthly?.keys()][0];
          if (monthlyDate === month) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`spcificEngagementTime.Warroom.monthly.${month}`]: monthlyIncrement,
                },
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Warroom.monthly`]: {
                    [`${month}`]: monthlyIncrement,
                  },
                },
              },
              session
            );
          }
        }

        for (const [year, time] of Object.entries(userEngagement.yearly)) {
          const yearlyIncrement = time / 3600; // Convert seconds to hours
          const yearlyDate = [...user?.spcificEngagementTime?.Warroom?.yearly?.keys()][0];
          if (yearlyDate === year) {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $inc: {
                  [`spcificEngagementTime.Warroom.yearly.${year}`]: yearlyIncrement,
                },
              },
              session
            );
          } else {
            await ClientService.updateClientByPhoneNumberWithSession(
              phoneNumber,
              {
                $set: {
                  [`spcificEngagementTime.Warroom.yearly`]: {
                    [`${year}`]: yearlyIncrement,
                  },
                },
              },
              session
            );
          }
        }

        await ClientService.updateClientByPhoneNumberWithSession(
          phoneNumber,
          {
            $inc: {
              "spcificEngagementTime.Warroom.total": totalEngagementTime / 60,
            },
          },
          session
        );
      } else {
        console.log(`User not found for phone number: ${phoneNumber}`);
      }
    }

    await session.commitTransaction();
    inMemoryEngagementData = {}; // Clear in-memory data after successful write
  } catch (error) {
    await session.abortTransaction();
    console.error("Error flushing engagement data to database:", error);
  } finally {
    session.endSession();
  }
};

router.post("/specificEengagement/time", (req, res) => {
  console.log("platform")
  const engagementData = req.body.engagementData;
  const platform = req.body.platform;

  engagementData.forEach(({ phoneNumber,LastPage, engagementTime, timestamp }) => {
    const date = new Date(timestamp); // Convert seconds to milliseconds
    const day = date.toISOString().slice(0, 10);
    const month = date.toISOString().slice(0, 7);
    const year = date.getFullYear();
    console.log(LastPage)
    if (platform == "Adira") {
      if (!AdirainMemoryEngagementData[phoneNumber]) {
        AdirainMemoryEngagementData[phoneNumber] = {
          daily: {},
          monthly: {},
          yearly: {},
          total: 0,
          lastPage:LastPage
        };
      }
      AdirainMemoryEngagementData[phoneNumber].lastPage=LastPagey
      AdirainMemoryEngagementData[phoneNumber].daily[day] =
        (AdirainMemoryEngagementData[phoneNumber].daily[day] || 0) +
        engagementTime;
      AdirainMemoryEngagementData[phoneNumber].monthly[month] =
        (AdirainMemoryEngagementData[phoneNumber].monthly[month] || 0) +
        engagementTime;
      AdirainMemoryEngagementData[phoneNumber].yearly[year] =
        (AdirainMemoryEngagementData[phoneNumber].yearly[year] || 0) +
        engagementTime;
      AdirainMemoryEngagementData[phoneNumber].total += engagementTime; // Add to total engagement time
      // AdirainMemoryEngagementData[phoneNumber].lastPage += engagementTime; // Add to total engagement time
    } else if (platform == "warroom") {
      if (!WarroominMemoryEngagementData[phoneNumber]) {
        WarroominMemoryEngagementData[phoneNumber] = {
          daily: {},
          monthly: {},
          yearly: {},
          total: 0,
          lastPage:""
        };
      }
      WarroominMemoryEngagementData[phoneNumber].daily[day] =
        (WarroominMemoryEngagementData[phoneNumber].daily[day] || 0) +
        engagementTime;
      WarroominMemoryEngagementData[phoneNumber].monthly[month] =
        (WarroominMemoryEngagementData[phoneNumber].monthly[month] || 0) +
        engagementTime;
      WarroominMemoryEngagementData[phoneNumber].yearly[year] =
        (WarroominMemoryEngagementData[phoneNumber].yearly[year] || 0) +
        engagementTime;
      WarroominMemoryEngagementData[phoneNumber].total += engagementTime; //
    }
  });

  res.status(200).json({ message: "Engagement data received" });
});
router.post("/engagement/time", (req, res) => {
  const engagementData = req.body;

  engagementData.forEach(({ phoneNumber, engagementTime, timestamp }) => {
    const date = new Date(timestamp); // Convert seconds to milliseconds
    const day = date.toISOString().slice(0, 10);
    const month = date.toISOString().slice(0, 7);
    const year = date.getFullYear();

    if (!inMemoryEngagementData[phoneNumber]) {
      inMemoryEngagementData[phoneNumber] = {
        daily: {},
        monthly: {},
        yearly: {},
        total: 0,
      };
    }

    inMemoryEngagementData[phoneNumber].daily[day] =
      (inMemoryEngagementData[phoneNumber].daily[day] || 0) + engagementTime;
    inMemoryEngagementData[phoneNumber].monthly[month] =
      (inMemoryEngagementData[phoneNumber].monthly[month] || 0) +
      engagementTime;
    inMemoryEngagementData[phoneNumber].yearly[year] =
      (inMemoryEngagementData[phoneNumber].yearly[year] || 0) + engagementTime;
    inMemoryEngagementData[phoneNumber].total += engagementTime; // Add to total engagement time
  });

  res.status(200).json({ message: "Engagement data received" });
});

setInterval(flushInMemoryDataToDatabase, 6000); // Flush to database every minute

module.exports = router;
