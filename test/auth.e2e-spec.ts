import { TLocalAuthUser } from '@/common/types';
import { UserEntity } from '@/users/entities/user.entity';

import { app } from './setup-e2e';

describe('Auth (e2e)', () => {
  const userDto = {
    email: 'testuser@example.com',
    password: 'StrongPass123!',
  };

  let authToken: string;

  it('POST /signup - success', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: userDto,
    });

    expect(response.statusCode).toBe(201);

    const responseBody = response.json<{
      user: TLocalAuthUser;
      access_token: string;
    }>();

    expect(responseBody).toHaveProperty('user');
    expect(responseBody).toHaveProperty('access_token');
    expect(responseBody.user).toHaveProperty('id');
    expect(responseBody.user).toHaveProperty('createdAt');
    expect(responseBody.user).toHaveProperty('updatedAt');
    expect(responseBody.user.email).toBe(userDto.email);
  });

  it('POST /login - success', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: userDto,
    });

    expect(response.statusCode).toBe(200);

    const responseBody = response.json<{
      user: TLocalAuthUser;
      access_token: string;
    }>();

    expect(responseBody).toHaveProperty('access_token');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user.email).toBe(userDto.email);

    authToken = responseBody.access_token;
  });

  it('POST /login - invalid password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: userDto.email,
        password: 'WrongPassword!',
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('POST /login - invalid email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'nonexistent@example.com',
        password: userDto.password,
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('GET /user - success', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/user',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.statusCode).toBe(200);

    const responseBody = response.json<TLocalAuthUser>();

    expect(responseBody).toHaveProperty('id');
    expect(responseBody.email).toBe(userDto.email);
    expect((responseBody as UserEntity).password).toBeUndefined();
  });

  it('POST /logout - success', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.statusCode).toBe(200);
  });
});
