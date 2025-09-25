import { validate } from 'class-validator';
import { CreateUserDto, LoginDto } from '@/dto/UserDto';

describe('UserDto Tests', () => {
    describe('CreateUserDto', () => {
        it('should validate correct user data', async () => {
            const dto = new CreateUserDto();
            dto.firstName = 'John';
            dto.lastName = 'Doe';
            dto.middleName = 'Smith';
            dto.birthDate = '1990-01-01';
            dto.email = 'john.doe@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should reject invalid email', async () => {
            const dto = new CreateUserDto();
            dto.firstName = 'John';
            dto.lastName = 'Doe';
            dto.middleName = 'Smith';
            dto.birthDate = '1990-01-01';
            dto.email = 'invalid-email';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should reject short password', async () => {
            const dto = new CreateUserDto();
            dto.firstName = 'John';
            dto.lastName = 'Doe';
            dto.middleName = 'Smith';
            dto.birthDate = '1990-01-01';
            dto.email = 'john.doe@example.com';
            dto.password = '123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });

        it('should reject empty firstName', async () => {
            const dto = new CreateUserDto();
            dto.firstName = '';
            dto.lastName = 'Doe';
            dto.middleName = 'Smith';
            dto.birthDate = '1990-01-01';
            dto.email = 'john.doe@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('firstName');
        });
    });

    describe('LoginDto', () => {
        it('should validate correct login data', async () => {
            const dto = new LoginDto();
            dto.email = 'john.doe@example.com';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should reject invalid email', async () => {
            const dto = new LoginDto();
            dto.email = 'invalid-email';
            dto.password = 'password123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should reject empty password', async () => {
            const dto = new LoginDto();
            dto.email = 'john.doe@example.com';
            dto.password = '';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });
    });
});