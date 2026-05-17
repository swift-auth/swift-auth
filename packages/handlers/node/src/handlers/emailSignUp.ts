import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function emailSignUp(ctx: Authio, req: Request, res: Response) {
   try {
      const result = ctx.schema.emailSignUp.safeParse(req.body);
      //sendError will format and check the error instanceof so we can just throw the zod error
      if (!result.success) {
         throw result.error;
      }

      const { email, name, password, returnVerificationToken } = result.data;

      const apiRes = await ctx.api.emailSignUp({
         name,
         email,
         password,
         returnVerificationToken,
         meta: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
         },
      });
      //if verifyEmail is true we will not log user in instead send the apiRes
      if (apiRes.code === 'VERIFICATION_SENT') {
         return res.status(201).json(apiRes);
      }

      //verifyEmail is false and autoSign is true so just log user in
      if (apiRes.code === 'SIGNUP_SUCCESS_AND_AUTO_SIGNIN' && 'session' in apiRes) {
         res.cookie(ctx.config.cookies.name, apiRes.session?.token, {
            httpOnly: true,
            secure: ctx.config.cookies.secure,
            sameSite: ctx.config.cookies.sameSite,
            domain: ctx.config.cookies.domain,
            expires: apiRes.session?.expiresAt,
         });
         return res.status(201).json(apiRes);
      }

      return res.status(201).json(apiRes);
   } catch (err) {
      return sendError(res, err, ctx.config.internal.logError);
   }
}
