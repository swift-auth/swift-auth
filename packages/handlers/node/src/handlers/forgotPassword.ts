// handlers/forgotPassword.ts
import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function forgotPassword(ctx: Authio, req: Request, res: Response) {
   try {
      const result = ctx.schema.forgotPassword.safeParse(req.body);
      if (!result.success) {
         throw result.error;
      }

      const { email, returnForgotPasswordToken } = result.data;

      const apiRes = await ctx.api.forgotPassword({ email, returnForgotPasswordToken });

      // always 200 regardless — prevents user enumeration
      return res.status(200).json(apiRes);
   } catch (err) {
      return sendError(res, err, ctx.config.internal.logError);
   }
}
