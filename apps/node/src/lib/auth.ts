import 'dotenv/config.js';
import { SwiftAuth } from 'swift-auth';
import { gitHubProvider, googleProvider } from 'swift-auth/providers';
// import { prismaAdapter } from '@swift-auth/prisma';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '../generated/prisma/client.js';
import { db } from '../db/index.js';
import { drizzleAdapter } from '@swift-auth/drizzle';

// Use an object so mutations are visible to anyone who imports this
export const testTokens = {
   latestVerificationToken: '',
   latestResetToken: '',
};

// const connectionString = `${process.env.DATABASE_URL}`;
// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });
//
const auth = new SwiftAuth({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      verifyEmail: true,
      verificationCallback: async ({ verificationToken }) => {
         testTokens.latestVerificationToken = verificationToken;
      },
      forgotPasswordCallback: async ({ resetToken }) => {
         testTokens.latestResetToken = resetToken;
      },
   },
   session: {
      expiry: 1000 * 60 * 60 * 48,
   },
   cookies: {
      name: 'swift',
      secure: true,
      sameSite: 'lax',
      domain: 'localhost',
   },
   socialProviders: {
      google: googleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
         redirectUrl: 'http://localhost:3000',
      }),
      github: gitHubProvider({
         clientId: process.env.GITHUB_CLIENT_ID!,
         clientSecret: process.env.GITHUB_CLIENT_SECRET!,
         redirectUrl: 'http://localhost:3000',
      }),
   },
   database: drizzleAdapter({
      db,
      provider: 'postgres',
   }),
});

export default auth;
