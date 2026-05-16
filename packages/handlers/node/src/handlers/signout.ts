// handlers/signout.ts
import { Authio } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';

export async function signout(ctx: Authio, req: Request, res: Response) {
   try {
      const token = req.cookies?.[ctx.config.cookies.name];
      if (!token) {
         return res.status(401).json({
            code: 'NO_SESSION',
            error: 'No session cookie found',
         });
      }

      const apiRes = await ctx.api.signout({ token });

      // clear the session cookie from the browser
      res.clearCookie(ctx.config.cookies.name);

      return res.status(200).json(apiRes);
   } catch (err) {
      return sendError(res, err);
   }
}
