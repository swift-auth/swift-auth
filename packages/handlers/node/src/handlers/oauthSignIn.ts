// handlers/oauthSignin.ts
import { Authio, SupportedSocialProvidersType } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';
import { isSupportedProvider } from '../utils/supportedProvider.js';

export async function oauthSignin(
   ctx: Authio,
   req: Request,
   res: Response,
   provider: SupportedSocialProvidersType,
) {
   if (!isSupportedProvider(provider, ctx.config)) {
      return res.status(400).json({
         code: 'UNSUPPORTED_PROVIDER',
         error: `Unsupported provider: ${provider}`,
      });
   }

   try {
      const { authUrl, state } = await ctx.api.oauthRedirectUrl({ id: provider });

      // store state in short-lived httpOnly cookie for CSRF protection
      res.cookie(ctx.config.internal.oauth.oauthStateCookie.name, state, {
         httpOnly: true,
         secure: ctx.config.cookies.secure,
         sameSite: 'lax', // must be lax — strict blocks cookie on redirect back from google
         maxAge: 1000 * 60 * 10, // 10 minutes
      });

      return res.redirect(authUrl);
   } catch (err) {
      return sendError(res, err);
   }
}
