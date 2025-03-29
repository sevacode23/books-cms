import { Test } from '@nestjs/testing';
import { Mock } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../entities/user.entity';

import { UsersService } from './users.service';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  let fakeUsersRepository: {
    findOneBy: Mock;
    findBy: Mock;
    create: Mock;
    save: Mock;
  };

  let mockUserId: string;
  let mockEmail: string;
  let mockPassword: string;
  let mockUser: UserEntity;

  beforeEach(async () => {
    mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    mockEmail = 'test@test.com';
    mockPassword = 'password';
    mockUser = {
      id: mockUserId,
      email: mockEmail,
      password: 'password',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    fakeUsersRepository = {
      findOneBy: vi.fn(),
      findBy: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: fakeUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneBy', () => {
    it('should call repository.findOneBy with the correct arguments', async () => {
      await service.findOneBy({ id: mockUserId });

      expect(fakeUsersRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });

    it('should return null if the user is not found', async () => {
      fakeUsersRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneBy({ id: mockUserId });

      expect(result).toBeNull();
    });

    it('should return the user if it is found', async () => {
      fakeUsersRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneBy({
        id: mockUserId,
        email: mockEmail,
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('findBy', () => {
    it('should call repository.findBy with the correct arguments', async () => {
      await service.findBy({ id: mockUserId });

      expect(fakeUsersRepository.findBy).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });

    it('should return an array of users', async () => {
      fakeUsersRepository.findBy.mockResolvedValue([mockUser]);

      const result = await service.findBy({ id: mockUserId });

      expect(result).toEqual([mockUser]);
    });
  });

  describe('create', () => {
    it('should call repository.findOneBy with the email', async () => {
      await service.create({
        email: mockEmail,
        password: mockPassword,
      });

      expect(fakeUsersRepository.findOneBy).toHaveBeenCalledWith({
        email: mockEmail,
      });
    });

    it('should throw an ConflictException if the user already exists', async () => {
      fakeUsersRepository.findOneBy.mockResolvedValue(mockUser);

      const promise = service.create({
        email: mockEmail,
        password: mockPassword,
      });

      expect(fakeUsersRepository.create).not.toHaveBeenCalled();
      expect(fakeUsersRepository.save).not.toHaveBeenCalled();
      await expect(promise).rejects.toThrow(ConflictException);
    });

    it('should call repository.create with the correct arguments', async () => {
      fakeUsersRepository.findOneBy.mockResolvedValue(null);

      await service.create({
        email: mockEmail,
        password: mockPassword,
      });
    });

    it('should call repository.save with the correct arguments', async () => {
      fakeUsersRepository.findOneBy.mockResolvedValue(null);
      fakeUsersRepository.create.mockReturnValue(mockUser);

      await service.create({
        email: mockEmail,
        password: mockPassword,
      });

      expect(fakeUsersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
