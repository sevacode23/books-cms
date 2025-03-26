import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Mock, vi } from 'vitest';

import { UsersService } from '@/users/services/users.service';
import { UserEntity } from '@/users/entities/user.entity';
import { TLocalAuthUser } from '@/common/types/request.types';

import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakePasswordService: { hash: Mock; compare: Mock };
  let fakeJwtService: { sign: Mock };
  let fakeUsersService: { findOneBy: Mock; create: Mock };

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockEmail = 'test@test.com';
  const mockPassword = 'password';
  const mockHashedPassword = 'hashedPassword';
  const mockToken = 'token';

  beforeEach(async () => {
    // Reset mocks
    fakePasswordService = {
      hash: vi.fn().mockResolvedValue(mockHashedPassword),
      compare: vi.fn(),
    };

    fakeJwtService = {
      sign: vi.fn().mockReturnValue(mockToken),
    };

    fakeUsersService = {
      findOneBy: vi.fn(),

      create: vi.fn().mockResolvedValue({
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PasswordService,
          useValue: fakePasswordService,
        },
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signJwt', () => {
    it('should return a token with the correct payload', () => {
      const uuid = mockUserId;
      const token = service.signJwt(uuid);

      expect(fakeJwtService.sign).toHaveBeenCalledWith({ sub: uuid });
      expect(token).toBe(mockToken);
    });
  });

  describe('signUp', () => {
    it('should hash the password and create a new user', async () => {
      const userDto = {
        email: mockEmail,
        password: mockPassword,
      };

      const result = await service.signUp(userDto);

      const expected = {
        user: {
          id: mockUserId,
          email: mockEmail,
        },
        access_token: mockToken,
      };

      expect(fakePasswordService.hash).toHaveBeenCalledWith(mockPassword);
      expect(fakeUsersService.create).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockHashedPassword,
      });
      expect(result).toEqual(expected);
      expect((result.user as UserEntity).password).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return null if the email is not found', async () => {
      fakeUsersService.findOneBy.mockResolvedValue(null);
      fakePasswordService.compare.mockResolvedValue(true);

      const result = await service.validateUser(mockEmail, mockPassword);

      expect(fakeUsersService.findOneBy).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(result).toBeNull();
      expect(fakePasswordService.compare).not.toHaveBeenCalled();
    });

    it('should return null if the password is invalid', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
      };

      fakeUsersService.findOneBy.mockResolvedValue(mockUser);
      fakePasswordService.compare.mockResolvedValue(false);

      const result = await service.validateUser(mockEmail, mockPassword);

      expect(fakeUsersService.findOneBy).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(fakePasswordService.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(result).toBeNull();
    });

    it('should return a user without password if the credentials are valid', async () => {
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
      };

      fakeUsersService.findOneBy.mockResolvedValue(mockUser);
      fakePasswordService.compare.mockResolvedValue(true);

      const result = await service.validateUser(mockEmail, mockPassword);

      expect(fakeUsersService.findOneBy).toHaveBeenCalledWith({
        email: mockEmail,
      });
      expect(fakePasswordService.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
      });
      expect((result as UserEntity).password).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should return an object with the user and a signed token', () => {
      const user: TLocalAuthUser = {
        id: mockUserId,
        email: mockEmail,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date('2021-01-01'),
      };

      const result = service.login(user);

      expect(fakeJwtService.sign).toHaveBeenCalledWith({ sub: mockUserId });
      expect(result).toEqual({
        user,
        access_token: mockToken,
      });
    });
  });

  describe('user', () => {
    it('should return a user by JWT payload id', async () => {
      const jwtUser = { id: mockUserId };

      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
      };

      fakeUsersService.findOneBy.mockResolvedValue(mockUser);

      const result = await service.user(jwtUser);

      expect(fakeUsersService.findOneBy).toHaveBeenCalledWith({
        id: mockUserId,
      });

      expect(result).toEqual({
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
      });
    });

    it('should return null if the user is not found', async () => {
      const jwtUser = { id: mockUserId };

      fakeUsersService.findOneBy.mockResolvedValue(null);

      const result = await service.user(jwtUser);

      expect(fakeUsersService.findOneBy).toHaveBeenCalledWith({
        id: mockUserId,
      });
      expect(result).toBeNull();
    });
  });
});
