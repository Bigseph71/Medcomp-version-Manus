import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserStatus } from './entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, UpdateProfileDto } from './dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Validate GDPR consent
    if (!dto.gdprConsent || !dto.dataProcessingConsent) {
      throw new BadRequestException(
        'GDPR consent and data processing consent are required',
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      gender: dto.gender,
      language: dto.language || 'fr',
      gdprConsent: true,
      gdprConsentDate: new Date(),
      dataProcessingConsent: true,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: savedUser.id,
      action: 'register',
      resourceType: 'user',
      resourceId: savedUser.id,
      details: { email: savedUser.email },
    });

    return this.generateTokens(savedUser);
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: [
        'id', 'email', 'passwordHash', 'firstName', 'lastName',
        'role', 'status', 'seniorModeEnabled', 'failedLoginAttempts',
        'lockedUntil',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Account locked until ${user.lockedUntil.toISOString()}. Too many failed attempts.`,
      );
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(
          Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000,
        );
        user.failedLoginAttempts = 0;
      }

      await this.userRepository.save(user);

      await this.auditService.log({
        userId: user.id,
        action: 'security_event',
        resourceType: 'auth',
        details: {
          event: 'failed_login',
          attempts: user.failedLoginAttempts,
          ipAddress,
        },
        riskLevel: 'medium',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Audit log
    await this.auditService.log({
      userId: user.id,
      action: 'login',
      resourceType: 'auth',
      details: { ipAddress },
    });

    return this.generateTokens(user);
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ─── Get Profile ───────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.auditService.log({
      userId,
      action: 'view_profile',
      resourceType: 'user',
      resourceId: userId,
    });

    return user;
  }

  // ─── Update Profile ────────────────────────────────────────────────────────

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);

    await this.auditService.log({
      userId,
      action: 'update_profile',
      resourceType: 'user',
      resourceId: userId,
      details: { updatedFields: Object.keys(dto) },
    });

    return updatedUser;
  }

  // ─── Delete Account (GDPR) ────────────────────────────────────────────────

  async deleteAccount(userId: string): Promise<void> {
    await this.auditService.log({
      userId,
      action: 'data_deletion',
      resourceType: 'user',
      resourceId: userId,
      details: { reason: 'user_request' },
    });

    await this.userRepository.softDelete(userId);
  }

  // ─── Export User Data (GDPR) ──────────────────────────────────────────────

  async exportUserData(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    await this.auditService.log({
      userId,
      action: 'data_export',
      resourceType: 'user',
      resourceId: userId,
    });

    // Remove sensitive fields
    const { passwordHash, twoFactorSecret, ...exportData } = user as any;
    return exportData;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = this.configService.get<number>('jwt.expiresIn', 3600);

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: `${this.configService.get('jwt.refreshExpiresIn', 604800)}s`,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        seniorModeEnabled: user.seniorModeEnabled,
      },
    };
  }
}
