const sessionCleanup = async (user) => {
  const currentTime = new Date();
  const sessionTimeout = 60 * 60 * 1000; // 1 hour session timeout for example

  console.log(user);

  // Filter out inactive sessions that have not been active for a long time
  user.sessions = user?.sessions?.filter((session) => {
    return currentTime - new Date(session?.lastActive) < sessionTimeout;
  });

  // If user exceeds session limit after cleanup, logout all sessions
  if (user?.sessions?.length >= user.sessionLimit) {
    user.sessions = []; // Clear all sessions
  }

  await user?.save();
};

module.exports = sessionCleanup;
