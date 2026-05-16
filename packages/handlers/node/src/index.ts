import { Authio, AuthioError, SupportedSocialProvidersType } from '@authio/core';
import { NextFunction, Request, Response } from 'express';
import { isSupportedProvider } from './utils/supportedProvider.js';
import { handlerTable } from './handlers/handlerTable.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/*
Every Handler should create a HandlerTable where all paths, methods and their corresponsing handler function
should be defined the handlerTable Object should follow the HandlerTable<Request, Response> type export
from the core package
*/

export function toNodeHandler(auth: Authio) {
   if (!auth) {
      throw new AuthioError('INVALID_AUTHIO_CONFIG', 'Please provide a valid Authio instance');
   }

   return async function (req: Request, res: Response, next: NextFunction) {
      const path = req.path;
      const method = req.method as HttpMethod;

      if (!path.startsWith('/api/auth')) return next();

      //handle oauth dynamic routes early
      const providerSigninPathMatch = path.match(/^\/api\/auth\/([\w-]+)\/signin$/);
      const providerCallbackPathMatch = path.match(/^\/api\/auth\/([\w-]+)\/callback$/);

      //GET api/auth/:provider/signin
      if (providerSigninPathMatch) {
         const provider = providerSigninPathMatch[1] as SupportedSocialProvidersType;
         if (isSupportedProvider(provider, auth.config) && method == 'GET') {
            return await handlerTable['/api/auth/:provider/signin']['GET'](
               auth,
               req,
               res,
               provider,
            );
         } else {
            return res
               .status(400)
               .json({ code: 'UNSUPPORTED_PROVIDER', error: `Unsupported provider: ${provider}` });
         }
      }

      //GET api/auth/:provider/callback
      if (providerCallbackPathMatch) {
         const provider = providerCallbackPathMatch[1] as SupportedSocialProvidersType;
         if (isSupportedProvider(provider, auth.config) && method == 'GET') {
            return await handlerTable['/api/auth/:provider/callback']['GET'](
               auth,
               req,
               res,
               provider,
            );
         } else {
            return res
               .status(400)
               .json({ code: 'UNSUPPORTED_PROVIDER', error: `Unsupported provider: ${provider}` });
         }
      }

      // static routes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const staticHandler = (handlerTable as any)[path]?.[method];
      if (staticHandler) {
         return staticHandler(auth, req, res);
      }

      // nothing matched
      return res.status(404).json({
         code: 'NOT_FOUND',
         error: `${method} ${path} is not a valid auth endpoint`,
      });
   };
}
