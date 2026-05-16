import { Authio } from '../core/authio.js';
import { SupportedSocialProvidersType } from './provider.types.js';

/*
Every Handler written for authio core should implement this HandlerTable interface.
This will help us to keep the patter of all the handlers we will create in future similar
and easier.
*/

export type PathTypes =
   | '/api/signup'
   | '/api/signin'
   | '/api/auth/verify-email'
   | '/api/auth/forgot-password'
   | '/api/auth/reset-password'
   | '/api/auth/session'
   | '/api/auth/signout'
   | '/api/auth/user'
   | '/api/auth/:provider/signin'
   | '/api/auth/:provider/callback';

type Handler<Req, Res> = (ctx: Authio, req: Req, res: Res) => Promise<unknown>;

type OauthHandler<Req, Res> = (
   ctx: Authio,
   req: Req,
   res: Res,
   provider: SupportedSocialProvidersType,
) => Promise<unknown>;

export interface HandlerTable<Req, Res> {
   '/api/signup': {
      POST: Handler<Req, Res>;
   };

   '/api/signin': {
      POST: Handler<Req, Res>;
   };

   '/api/auth/verify-email': {
      GET: Handler<Req, Res>;
   };

   '/api/auth/forgot-password': {
      POST: Handler<Req, Res>;
   };

   '/api/auth/reset-password': {
      POST: Handler<Req, Res>;
   };

   '/api/auth/session': {
      GET: Handler<Req, Res>;
   };

   '/api/auth/signout': {
      POST: Handler<Req, Res>;
   };

   '/api/auth/user': {
      DELETE: Handler<Req, Res>;
   };

   '/api/auth/:provider/signin': {
      GET: OauthHandler<Req, Res>;
   };

   '/api/auth/:provider/callback': {
      GET: OauthHandler<Req, Res>;
   };
}
