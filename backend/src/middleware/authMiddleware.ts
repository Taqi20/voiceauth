import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(500).json({ message: 'JWT secret not configured' });
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret as string);
            if (
                typeof decoded === 'object' &&
                decoded !== null &&
                'id' in decoded &&
                typeof (decoded as JwtPayload).id === 'string'
            ) {
                req.user = { id: (decoded as JwtPayload).id };
                next();
            } else {
                return res.status(401).json({ message: 'Invalid token payload' });
            }
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};