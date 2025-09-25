import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorizeAdmin, authorizeSelfOrAdmin } from '@/middleware/auth';
import { User, UserRole } from '@/entities/User';
import { testDataSource } from '../../setup';

// Мокаем зависимости
jest.mock('jsonwebtoken');
jest.mock('@/config/database');

describe('Auth Middleware Tests', () => {
    let mockRequest: Partial<Request & { user?: User }>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            header: jest.fn()
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should return 401 if no token provided', async () => {
            mockRequest.header = jest.fn().mockReturnValue(undefined);

            await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 if invalid token', async () => {
            const token = 'invalid-token';
            mockRequest.header = jest.fn().mockReturnValue(`Bearer ${token}`);
            (jwt.verify as jest.MockedFunction<typeof jwt.verify>).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 if user is blocked', async () => {
            const token = 'valid-token';
            const decoded = { userId: 'user-123' };
            const mockUser: User = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                birthDate: new Date('1990-01-01'),
                email: 'john.doe@example.com',
                password: 'hashed-password',
                role: UserRole.USER,
                status: 'blocked' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.header = jest.fn().mockReturnValue(`Bearer ${token}`);
            (jwt.verify as jest.MockedFunction<typeof jwt.verify>).mockImplementation(() => decoded);

            const mockRepository = {
                findOne: jest.fn().mockResolvedValue(mockUser)
            };
            jest.spyOn(testDataSource, 'getRepository').mockReturnValue(mockRepository as any);

            await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('authorizeAdmin', () => {
        it('should call next() for admin user', () => {
            const mockUser: User = {
                id: 'admin-123',
                firstName: 'Admin',
                lastName: 'User',
                middleName: 'Test',
                birthDate: new Date('1985-05-15'),
                email: 'admin@example.com',
                password: 'hashed-password',
                role: UserRole.ADMIN,
                status: 'active' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.user = mockUser;

            authorizeAdmin(mockRequest as any, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return 403 for non-admin user', () => {
            const mockUser: User = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                birthDate: new Date('1990-01-01'),
                email: 'john.doe@example.com',
                password: 'hashed-password',
                role: UserRole.USER,
                status: 'active' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.user = mockUser;

            authorizeAdmin(mockRequest as any, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied. Admin role required.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('authorizeSelfOrAdmin', () => {
        it('should call next() for admin accessing any user', () => {
            const mockUser: User = {
                id: 'admin-123',
                firstName: 'Admin',
                lastName: 'User',
                middleName: 'Test',
                birthDate: new Date('1985-05-15'),
                email: 'admin@example.com',
                password: 'hashed-password',
                role: UserRole.ADMIN,
                status: 'active' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.user = mockUser;
            mockRequest.params = { id: 'user-456' };

            authorizeSelfOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should call next() for user accessing own data', () => {
            const mockUser: User = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                birthDate: new Date('1990-01-01'),
                email: 'john.doe@example.com',
                password: 'hashed-password',
                role: UserRole.USER,
                status: 'active' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.user = mockUser;
            mockRequest.params = { id: 'user-123' };

            authorizeSelfOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return 403 for user accessing other user data', () => {
            const mockUser: User = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                middleName: 'Smith',
                birthDate: new Date('1990-01-01'),
                email: 'john.doe@example.com',
                password: 'hashed-password',
                role: UserRole.USER,
                status: 'active' as any,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockRequest.user = mockUser;
            mockRequest.params = { id: 'user-456' };

            authorizeSelfOrAdmin(mockRequest as any, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access denied. Can only access your own data or admin required.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});