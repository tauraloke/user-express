import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';

export interface AuthRequest extends Request {
    user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ error: 'Access denied. No token provided.' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user || user.status === 'blocked') {
            res.status(401).json({ error: 'Invalid token or user is blocked.' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
        return;
    }
    next();
};

export const authorizeSelfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.params.id;

    if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.id !== userId)) {
        res.status(403).json({ error: 'Access denied. Can only access your own data or admin required.' });
        return;
    }
    next();
};