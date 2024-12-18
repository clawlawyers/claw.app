const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const { sendWelcomeEmail } = require("../config/nodemailer");
const Client = require("../models/client");

// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "http://localhost:8000/api/v1/client/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await Client.findOne({
          email: profile.emails[0].value,
        });
        console.log(accessToken);
        console.log(refreshToken);

        if (!user) {
          // // If the user doesn't exist, create a new user
          // user = new Client({
          //   googleAuthId: profile.id,
          //   name: profile.displayName,
          //   email: profile.emails[0].value,
          // });
          // await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
