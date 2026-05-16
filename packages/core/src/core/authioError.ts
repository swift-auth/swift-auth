import { ZodError, z } from 'zod';

export class AuthioError extends Error {
   constructor(
      public code: string,
      message: string,
   ) {
      super(message);
      this.name = 'AuthioError';
   }

   // check if error is a zod validation error
   static isZodError(err: unknown): err is ZodError {
      return err instanceof ZodError;
   }

   // format zod error into a clean object
   static formatZodError(err: ZodError) {
      return {
         code: 'VALIDATION_ERROR',
         error: z.flattenError(err),
      };
   }

   // check if authio error
   static isAuthioError(err: unknown): err is AuthioError {
      return err instanceof AuthioError;
   }
}
