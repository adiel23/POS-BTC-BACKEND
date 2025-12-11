import { Request } from "express";

export type AuthenticatedUser = {
    sub: string;
    pubkey: string;
    iat: number
}

export interface AuthRequest extends Request {
    user: AuthenticatedUser;
}