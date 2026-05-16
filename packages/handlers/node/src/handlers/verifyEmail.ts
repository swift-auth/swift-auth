// handlers/verifyEmail.ts
import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function verifyEmail(ctx: Authio, req: Request, res: Response) {
   try {
      const result = ctx.schema.verifyEmail.safeParse(req.query);
      if (!result.success) {
         throw result.error;
      }

      const { token } = result.data;

      const apiRes = await ctx.api.verifyEmail({ token });

      // EMAIL_VERIFIED with autoSignIn — session created, set the cookie
      if (apiRes.code === 'EMAIL_VERIFIED' && apiRes.session) {
         res.cookie(ctx.config.cookies.name, apiRes.session.token, {
            httpOnly: true,
            secure: ctx.config.cookies.secure,
            sameSite: ctx.config.cookies.sameSite,
            domain: ctx.config.cookies.domain,
            expires: apiRes.session.expiresAt,
         });
      }

      return res.status(200).json(apiRes);
   } catch (err) {
      return sendError(res, err);
   }
}
