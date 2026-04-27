import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '@dinero/shared';
import { CreateBankConnectionUseCase } from '../../../application/use-cases/create-bank-connection.use-case';
import { ListBankConnectionsUseCase } from '../../../application/use-cases/list-bank-connections.use-case';
import { RevokeBankConnectionUseCase } from '../../../application/use-cases/revoke-bank-connection.use-case';
import { CreateBankConnectionDto } from '../../../application/dtos/create-bank-connection.dto';

@Controller('bank-connections')
@UseGuards(JwtAuthGuard)
export class BankConnectionController {
  constructor(
    private readonly createBankConnectionUseCase: CreateBankConnectionUseCase,
    private readonly listBankConnectionsUseCase: ListBankConnectionsUseCase,
    private readonly revokeBankConnectionUseCase: RevokeBankConnectionUseCase,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateBankConnectionDto,
  ) {
    const result = await this.createBankConnectionUseCase.execute({
      userId: req.user.sub,
      institutionId: dto.institutionId,
      institutionName: dto.institutionName,
    });
    return { data: result.getValue() };
  }

  @Get()
  async list(@Req() req: Request & { user: JwtPayload }) {
    const result = await this.listBankConnectionsUseCase.execute({ userId: req.user.sub });
    return { data: result.getValue() };
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    const result = await this.revokeBankConnectionUseCase.execute({ id, userId: req.user.sub });
    if (result.isFailure()) {
      if (result.error === 'Bank connection not found') throw new NotFoundException(result.error);
      throw new ForbiddenException(result.error);
    }
    return { data: { message: 'Connection revoked successfully' } };
  }
}
