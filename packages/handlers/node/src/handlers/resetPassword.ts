// handlers/resetPassword.ts
import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function resetPassword(ctx: Authio, req: Request, res: Response) {
   try {
      const result = ctx.schema.resetPassword.safeParse(req.body);
      if (!result.success) {
         throw result.error;
      }

      const { token, newPassword } = result.data;

      const apiRes = await ctx.api.resetPassword({ token, newPassword });

      // all sessions were invalidated — clear the session cookie too
      res.clearCookie(ctx.config.cookies.name);

      return res.status(200).json(apiRes);
   } catch (err) {
      return sendError(res, err, ctx.config.internal.logError);
   }
}
