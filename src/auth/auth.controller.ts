import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { Serialize } from '@/common/interceptors/serialize.interceptor';
import { UserDto } from '@/users/dtos/user.dto';
import {
  ILocalAuthUserRequest,
  IJwtAuthUserRequest,
} from '@/common/types/request.types';

import { AuthService } from './services/auth.service';
import { LocalAuthGuard } from './guards/local-atuth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AUTH_ROUTES } from './auth.constants';

/**
 * Authentication controller
 */
@Controller(AUTH_ROUTES.ROOT)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(AUTH_ROUTES.SIGNUP)
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post(AUTH_ROUTES.LOGIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(@Request() req: ILocalAuthUserRequest) {
    return this.authService.login(req.user);
  }

  @Post(AUTH_ROUTES.LOGOUT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout() {}

  @Get(AUTH_ROUTES.USER)
  @UseGuards(JwtAuthGuard)
  @Serialize(UserDto)
  user(@Request() req: IJwtAuthUserRequest) {
    return this.authService.user(req.user);
  }
}
