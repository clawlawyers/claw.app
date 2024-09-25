const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Fetch all messages from the database where textArray is empty
  const messages = await prisma.message.findMany({
    where: {
      textArray: {
        equals: [], // Use equals filter with an empty array to find empty lists
      },
    },
  });

  for (const message of messages) {
    // Convert the existing string text to an array with a single element
    const textArray = [message.text];

    // Update the message with the new text array format
    await prisma.message.update({
      where: { id: message.id },
      data: { textArray: textArray },
    });

    console.log(`Updated message ID: ${message.id}`);
  }

  console.log("All messages have been updated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
