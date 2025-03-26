import { Test } from '@nestjs/testing';

import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password with valid length', async () => {
      const password = 'password';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toHaveLength(60);
    });
  });

  describe('compare', () => {
    it('should return true if the password is equal to the hashed password', async () => {
      const password = 'password';

      const hashedPassword = await service.hash(password);

      const isMatch = await service.compare(password, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it('should return false if the password is not equal to the hashed password', async () => {
      const password = 'password';
      const wrongPassword = 'wrong password';

      const hashedPassword = await service.hash(password);

      const isMatch = await service.compare(wrongPassword, hashedPassword);

      expect(isMatch).toBe(false);
    });
  });
});
