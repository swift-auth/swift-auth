// handlers/oauthCallback.ts
import { Authio, SupportedSocialProvidersType } from '@authio/core';
import { Request, Response } from 'express';
import { sendError } from '../utils/error.js';
import { isSupportedProvider } from '../utils/supportedProvider.js';

export async function oauthCallback(
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

   const { code, state } = req.query as { code?: string; state?: string };

   // CSRF check — state in URL came from google (untrusted)
   // state in cookie was set by us in /signin (trusted)
   const storedState = req.cookies?.[ctx.config.internal.oauth.oauthStateCookie.name];
   if (!state || !storedState || state !== storedState) {
      return res.status(400).json({
         code: 'INVALID_STATE',
         error: 'Invalid OAuth state — possible CSRF attack',
      });
   }

   if (!code) {
      return res.status(400).json({
         code: 'MISSING_CODE',
         error: 'Missing authorization code',
      });
   }

   try {
      const apiRes = await ctx.api.oauthCallback({
         id: provider,
         code,
         meta: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
         },
      });

      // state cookie served its purpose — clear it
      res.clearCookie(ctx.config.internal.oauth.oauthStateCookie.name);

      // set real session cookie
      res.cookie(ctx.config.cookies.name, apiRes.session.token, {
         httpOnly: true,
         secure: ctx.config.cookies.secure,
         sameSite: ctx.config.cookies.sameSite,
         domain: ctx.config.cookies.domain,
         expires: apiRes.session.expiresAt,
      });

      return res.redirect(apiRes.redirectUrl);
   } catch (err) {
      return sendError(res, err, ctx.config.internal.logError);
   }
}
