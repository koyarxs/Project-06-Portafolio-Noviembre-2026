import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service.ts';
import { ApiItemResponse, ApiPublicErrors } from '../common/api-response.decorator.ts';
import { ProfileResponseDto } from '../common/public-response.dto.ts';
import { EmptyQueryDto } from '../common/query.dto.ts';

@ApiTags('Profile') @ApiPublicErrors() @Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}
  @Get() @ApiOperation({ summary: 'Perfil profesional público, sin correo privado ni campos internos' })
  @ApiItemResponse(ProfileResponseDto)
  async get(@Query() _query: EmptyQueryDto) { return { data: await this.service.get() }; }
}
