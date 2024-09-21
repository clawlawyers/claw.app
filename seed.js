const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create Plans
  //   const planFree = await prisma.plan.create({
  //     data: {
  //       name: "free",
  //       session: 1,
  //       token: 10,
  //     },
  //   });

  const planPremium = await prisma.plan.create({
    data: {
      name: "PRO_5_1",
      session: 10,
      token: 100,
    },
  });

  //   //   // Create Users
  //   const users = [];
  //   for (let i = 1; i <= 10; i++) {
  //     const user = await prisma.user.create({
  //       data: {
  //         mongoId: `user${i}`,
  //         phoneNumber: `12345678${i}`, // Ensuring phone number is exactly 10 characters
  //         planName: i <= 5 ? planFree.name : planPremium.name,
  //         tokenUsed: Math.random() * 10,
  //       },
  //     });
  //     users.push(user);
  //   }

  //   // Create Referral Codes
  //   const referralCodes = [];
  //   for (let i = 1; i <= 5; i++) {
  //     const referralCode = await prisma.referralCode.create({
  //       data: {
  //         generatedById: users[i - 1].mongoId,
  //         redeemed: i % 2 === 0,
  //         redeemedBy:
  //           i % 2 === 0 ? { connect: { mongoId: users[9].mongoId } } : undefined,
  //       },
  //     });
  //     referralCodes.push(referralCode);
  //   }

  //   // Create Models
  //   const models = [];
  //   for (let i = 1; i <= 2; i++) {
  //     const model = await prisma.model.create({
  //       data: {
  //         name: `legalGPT${i}`,
  //         version: 1.0 + i,
  //       },
  //     });
  //     models.push(model);
  //   }

  //   // Create Sessions
  //   const sessions = [];
  //   for (let i = 1; i <= 5; i++) {
  //     const session = await prisma.session.create({
  //       data: {
  //         name: `session${i}`,
  //         userId: users[i - 1].mongoId,
  //         modelName: models[0].name,
  //       },
  //     });
  //     sessions.push(session);
  //   }

  //   // Create Messages
  //   const messages = [];
  //   for (let i = 1; i <= 5; i++) {
  //     const message = await prisma.message.create({
  //       data: {
  //         text: `Message text ${i}`,
  //         isUser: i % 2 === 0,
  //         sessionId: sessions[0].id,
  //       },
  //     });
  //     messages.push(message);
  //   }

  //   // Create Feedback
  //   for (let i = 1; i <= 3; i++) {
  //     await prisma.feedback.create({
  //       data: {
  //         rating: Math.floor(Math.random() * 5) + 1,
  //         messageId: messages[i - 1].id,
  //       },
  //     });
  //   }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
