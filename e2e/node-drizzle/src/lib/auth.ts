import { Authio } from '@authio/core';
import { prismaAdapter } from '@authio/prisma';

import { prisma } from '../lib/prisma.js';

const auth = new Authio({
   database: prismaAdapter({
      db: prisma,
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