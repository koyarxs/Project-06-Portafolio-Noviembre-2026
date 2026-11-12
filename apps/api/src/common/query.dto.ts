import { Transform } from 'class-transformer';
import { Equals, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ProjectType, SecurityLabStatus, TechnologyCategory } from '../../../../generated/prisma/enums.ts';

const integer = ({ value }: { value: unknown }) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
const boolean = ({ value }: { value: unknown }) => value === 'true' ? true : value === 'false' ? false : value;
export class EmptyQueryDto {
  // Metadata de validación sin aceptar propiedades públicas adicionales.
  @Equals(undefined) private readonly _empty?: never;
}
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 100000 })
  @Transform(integer) @IsInt() @Min(1) @Max(100000)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Transform(integer) @IsInt() @Min(1) @Max(100)
  limit = 20;
}

export class SlugParamDto {
  @ApiProperty({ example: 'fraudshield', maxLength: 220, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
  @IsString() @MaxLength(220) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;
}

export class ProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProjectStatus }) @IsOptional() @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectType }) @IsOptional() @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ example: 'typescript', maxLength: 120 })
  @IsOptional() @IsString() @MaxLength(120) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  technology?: string;

  @ApiPropertyOptional({ type: Boolean }) @IsOptional() @Transform(boolean) @IsBoolean()
  featured?: boolean;
}

export class TechnologiesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TechnologyCategory }) @IsOptional() @IsEnum(TechnologyCategory)
  category?: TechnologyCategory;

  @ApiPropertyOptional({ type: Boolean }) @IsOptional() @Transform(boolean) @IsBoolean()
  featured?: boolean;
}

export class SecurityLabsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SecurityLabStatus }) @IsOptional() @IsEnum(SecurityLabStatus)
  status?: SecurityLabStatus;
}
