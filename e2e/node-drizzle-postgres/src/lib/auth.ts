import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import { db } from '../db/index.js';
const auth = new Authio({
   database: drizzleAdapter({
      db,
      provider: 'postgres',
   }),

   baseUrl: `http://localhost:${process.env.PORT!}`,
   emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      verifyEmail: true,
      verificationCallback: async (data) => {
    
      },
      forgotPasswordCallback: async (data) => {
    
      },
   },
});

export default auth;