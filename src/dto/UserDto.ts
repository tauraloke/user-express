import { IsNotEmpty, Length, IsEmail, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { UserRole, UserStatus } from '../entities/User';

export class CreateUserDto {
    @IsNotEmpty()
    @Length(1, 100)
    firstName!: string;

    @IsNotEmpty()
    @Length(1, 100)
    lastName!: string;

    @IsNotEmpty()
    @Length(1, 100)
    middleName!: string;

    @IsDateString()
    birthDate!: string;

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @Length(6, 255)
    password!: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.USER;
}

export class UpdateUserDto {
    @IsOptional()
    @Length(1, 100)
    firstName?: string;

    @IsOptional()
    @Length(1, 100)
    lastName?: string;

    @IsOptional()
    @Length(1, 100)
    middleName?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;
}

export class BlockUserDto {
    @IsOptional()
    @IsBoolean()
    block?: boolean = true;
}