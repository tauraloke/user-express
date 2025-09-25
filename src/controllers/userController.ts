import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';
import { AuthRequest } from '../middleware/auth';

export class UserController {
    // Get all users (admin only)
    static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find({
                select: ['id', 'firstName', 'lastName', 'middleName', 'birthDate', 'email', 'role', 'status', 'createdAt', 'updatedAt']
            });

            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    // Get user by ID
    static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: { id: userId },
                select: ['id', 'firstName', 'lastName', 'middleName', 'birthDate', 'email', 'role', 'status', 'createdAt', 'updatedAt']
            });

            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    // Block user (no unblock option)
    static async blockUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }

            // Block user (no unblock option according to requirements)
            user.status = UserStatus.BLOCKED;
            await userRepository.save(user);

            res.status(200).json({
                success: true,
                message: 'User blocked successfully',
                data: {
                    id: user.id,
                    status: user.status
                }
            });
        } catch (error) {
            next(error);
        }
    }
}