import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { GetProfileUseCase } from '../../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/update-profile.use-case';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get('me')
  async getMe(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.getProfileUseCase.execute({ userId: req.user.sub });
    if (result.isFailure()) throw new NotFoundException(result.error);
    return { data: result.getValue() };
  }

  @Put('me')
  async updateMe(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.updateProfileUseCase.execute({
      userId: req.user.sub,
      name: dto.name,
      phone: dto.phone,
      birthDate: dto.birthDate,
      location: dto.location,
    });
    if (result.isFailure()) throw new UnprocessableEntityException(result.error);
    return { data: result.getValue() };
  }
}
