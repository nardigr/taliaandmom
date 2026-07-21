import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  try {
    const count = await db.chatSession.count();
    console.log("chatSession count:", count);
  } catch (e) {
    console.error("prisma error:", e instanceof Error ? e.message : e);
  }

  try {
    console.log("locale:", new Date().toLocaleString("sq-AL"));
  } catch (e) {
    console.error("locale error:", e instanceof Error ? e.message : e);
  }
}

main().finally(() => db.$disconnect());
