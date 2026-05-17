import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function emailSignIn(ctx: Authio, req: Request, res: Response) {
   try {
      const result = ctx.schema.emailSignIn.safeParse(req.body);
      if (!result.success) {
         throw result.error;
      }

      const { email, password } = result.data;

      const apiRes = await ctx.api.emailSignIn({
         email,
         password,
         meta: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
         },
      });

      // signin always returns a session — set the cookie
      res.cookie(ctx.config.cookies.name, apiRes.session.token, {
         httpOnly: true,
         secure: ctx.config.cookies.secure,
         sameSite: ctx.config.cookies.sameSite,
         domain: ctx.config.cookies.domain,
         expires: apiRes.session.expiresAt,
      });

      return res.status(200).json(apiRes);
   } catch (err) {
      return sendError(res, err, ctx.config.internal.logError);
   }
}
