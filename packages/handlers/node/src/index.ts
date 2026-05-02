import { SwiftAuth } from 'swift-auth';
import { Request, Response } from 'express';

export function toNodeHandler(auth: SwiftAuth) {
  return function (req: Request, res: Response) { };
}
