import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { CreateUserDto, LoginDto } from '../dto/UserDto';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    // Register user
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = new CreateUserDto();
            Object.assign(userData, req.body);

            const errors = await validate(userData);
            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    errors: errors.map(error => ({
                        field: error.property,
                        message: Object.values(error.constraints || {})[0]
                    }))
                });
                return;
            }

            const userRepository = AppDataSource.getRepository(User);

            // Check if user already exists
            const existingUser = await userRepository.findOne({ where: { email: userData.email } });
            if (existingUser) {
                res.status(400).json({ success: false, error: 'User already exists with this email' });
                return;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);

            const user = userRepository.create(userData);
            await userRepository.save(user);

            // Generate JWT token
            if (!process.env.JWT_SECRET) {
                res.status(500).json({ success: false, error: 'JWT secret not configured' });
                return;
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            } as jwt.SignOptions);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        middleName: user.middleName,
                        email: user.email,
                        role: user.role,
                        status: user.status
                    },
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Login user
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData = new LoginDto();
            Object.assign(loginData, req.body);

            const errors = await validate(loginData);
            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    errors: errors.map(error => ({
                        field: error.property,
                        message: Object.values(error.constraints || {})[0]
                    }))
                });
                return;
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { email: loginData.email } });

            if (!user) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }

            if (user.status === 'blocked') {
                res.status(401).json({ success: false, error: 'Account is blocked' });
                return;
            }

            const isValidPassword = await bcrypt.compare(loginData.password, user.password);
            if (!isValidPassword) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }

            // Generate JWT token
            if (!process.env.JWT_SECRET) {
                res.status(500).json({ success: false, error: 'JWT secret not configured' });
                return;
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            } as jwt.SignOptions);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        middleName: user.middleName,
                        email: user.email,
                        role: user.role,
                        status: user.status
                    },
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get current user
    static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'Not authenticated' });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: req.user.id,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        middleName: req.user.middleName,
                        birthDate: req.user.birthDate,
                        email: req.user.email,
                        role: req.user.role,
                        status: req.user.status,
                        createdAt: req.user.createdAt,
                        updatedAt: req.user.updatedAt
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}