import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  RegisterUserUseCase,
  RegisterUserInput,
} from '../../../application/use-cases/register-user.use-case';
import {
  LoginUseCase,
  LoginInput,
} from '../../../application/use-cases/login.use-case';
import { RegisterUserDto } from '../../../application/dtos/register-user.dto';
import { LoginDto } from '../../../application/dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const input: RegisterUserInput = {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      birthDate: dto.birthDate,
      location: dto.location,
    };
    const result = await this.registerUserUseCase.execute(input);
    if (result.isFailure()) {
      throw new UnprocessableEntityException(result.error);
    }
    return { data: result.getValue() };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const input: LoginInput = { email: dto.email, password: dto.password };
    const result = await this.loginUseCase.execute(input);
    if (result.isFailure()) {
      throw new UnauthorizedException(result.error);
    }
    return { data: result.getValue() };
  }
}
