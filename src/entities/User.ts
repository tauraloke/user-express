import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, Length, IsEnum, IsDateString } from 'class-validator';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum UserStatus {
    ACTIVE = 'active',
    BLOCKED = 'blocked'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    @IsNotEmpty()
    @Length(1, 100)
    firstName!: string;

    @Column({ type: 'varchar', length: 100 })
    @IsNotEmpty()
    @Length(1, 100)
    lastName!: string;

    @Column({ type: 'varchar', length: 100 })
    @IsNotEmpty()
    @Length(1, 100)
    middleName!: string;

    @Column({ type: 'date' })
    @IsDateString()
    birthDate!: Date;

    @Column({ type: 'varchar', length: 255, unique: true })
    @IsEmail()
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    @IsNotEmpty()
    @Length(6, 255)
    password!: string;

    @Column({
        type: 'varchar',
        enum: UserRole,
        default: UserRole.USER
    })
    @IsEnum(UserRole)
    role!: UserRole;

    @Column({
        type: 'varchar',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @IsEnum(UserStatus)
    status!: UserStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}