import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
            req.user = { id: decoded.id };
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};