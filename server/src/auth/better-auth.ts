import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { google } from "better-auth/plugins";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: ["http://localhost:3000", "http://localhost:8081", "exp://localhost:8081"],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      weight: {
        type: "number",
        required: false,
      },
      height: {
        type: "number",
        required: false,
      },
      age: {
        type: "number",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      activityLevel: {
        type: "string",
        required: false,
      },
      profile_completed: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});