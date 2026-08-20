const path = require("path");
const { PrismaClient } = require(path.join(__dirname, "..", "..", "generated", "prisma"));
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;