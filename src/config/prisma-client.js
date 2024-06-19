const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma || new PrismaClient();

global.prisma = prisma;

module.exports = prisma;
