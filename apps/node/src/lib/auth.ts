import { SwiftAuth } from 'swift-auth';
import { db } from '../db/index.js';
import { drizzleAdapter } from '@swift-auth/drizzle';
import { gitHubProvider, googleProvider } from 'swift-auth/providers';

export const auth = new SwiftAuth({
   baseUrl: 'http://localhost:8000',
   emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      verifyEmail: true,
      verificationCallback: async ({ name, email, verificationToken }) => {
         console.log('verification callback called with values: ', name, email, verificationToken);
      },
      forgotPasswordCallback: async ({ name, email, resetToken }) => {
         console.log('forgot password callback called: ', name, email, resetToken);
      },
   },

   session: {
      //expiry value will be added to Date.now()
      expiry: 1000 * 60 * 60 * 48, //48 hours
   },
   //httpOnly will always be true for security
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
   database: drizzleAdapter(db),
});
