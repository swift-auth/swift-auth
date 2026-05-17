import { HandlerTable } from '@authio/core';
import { deleteUser } from './deleteUser.js';
import { emailSignIn } from './emailSignIn.js';
import { emailSignUp } from './emailSignUp.js';
import { forgotPassword } from './forgotPassword.js';
import { oauthCallback } from './oauthCallback.js';
import { oauthSignin } from './oauthSignIn.js';
import { resetPassword } from './resetPassword.js';
import { getSession } from './session.js';
import { signout } from './signout.js';
import { verifyEmail } from './verifyEmail.js';
import { Request, Response } from 'express';

export const handlerTable: HandlerTable<Request, Response> = {
   '/api/auth/signup': {
      POST: emailSignUp,
   },
   '/api/auth/signin': {
      POST: emailSignIn,
   },
   '/api/auth/verify-email': {
      GET: verifyEmail,
   },
   '/api/auth/forgot-password': {
      POST: forgotPassword,
   },
   '/api/auth/reset-password': {
      POST: resetPassword,
   },
   '/api/auth/session': {
      GET: getSession,
   },
   '/api/auth/signout': {
      POST: signout,
   },

   '/api/auth/user': {
      DELETE: deleteUser,
   },

   '/api/auth/:provider/signin': {
      GET: oauthSignin,
   },

   '/api/auth/:provider/callback': {
      GET: oauthCallback,
   },
};
