import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJwtAuthUser, TLocalAuthUser } from '@/common/types/request.types';
import { UsersService } from '@/users/services/users.service';
import { CreateUserDto } from '@/users/dtos/create-user.dto';

import { PasswordService } from './password.service';

/** Authentication service */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  /** Creates a JWT token for a user */
  signJwt(id: string) {
    return this.jwtService.sign({ sub: id });
  }

  /** Registers a new user and returns token */
  async signUp(createUserDto: CreateUserDto) {
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: this.signJwt(user.id),
    };
  }

  /** Validates user credentials
   *  Used in LocalStrategy
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneBy({ email });

    if (user) {
      const isPasswordValid = await this.passwordService.compare(
        password,
        user.password,
      );

      if (isPasswordValid) {
        const { password: _, ...result } = user;

        return result;
      }
    }

    return null;
  }

  /** Logs in a user and returns token */
  login(user: TLocalAuthUser) {
    return {
      user,
      access_token: this.signJwt(user.id),
    };
  }

  /** Gets a user by JWT payload */
  user(jwtPayload: IJwtAuthUser) {
    return this.usersService.findOneBy({ id: jwtPayload.id });
  }
}
