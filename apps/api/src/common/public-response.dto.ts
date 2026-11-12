import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus, DeploymentProvider, DeploymentStatus, EmploymentType, MediaType, ProjectStatus, ProjectType, SecurityLabStatus, TechnologyCategory } from '../../../../generated/prisma/enums.ts';

export class ProfileResponseDto {
  @ApiProperty() fullName!: string;
  @ApiProperty() professionalTitle!: string;
  @ApiProperty({ type: String, nullable: true }) headline!: string | null;
  @ApiProperty({ type: String, nullable: true }) biography!: string | null;
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
  @ApiProperty({ type: String, nullable: true }) githubUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) linkedinUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) resumeUrl!: string | null;
  @ApiProperty({ enum: AvailabilityStatus }) availabilityStatus!: AvailabilityStatus;
}

export class TechnologyResponseDto {
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ enum: TechnologyCategory }) category!: TechnologyCategory;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, nullable: true }) iconUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) websiteUrl!: string | null;
  @ApiProperty() isFeatured!: boolean;
  @ApiProperty() sortOrder!: number;
}

export class ProjectMediaResponseDto {
  @ApiProperty({ enum: MediaType }) mediaType!: MediaType;
  @ApiProperty() url!: string;
  @ApiProperty({ type: String, nullable: true }) altText!: string | null;
  @ApiProperty({ type: String, nullable: true }) caption!: string | null;
  @ApiProperty() sortOrder!: number;
}

export class ProjectDeploymentResponseDto {
  @ApiProperty({ enum: DeploymentProvider }) provider!: DeploymentProvider;
  @ApiProperty({ type: String, nullable: true }) deploymentUrl!: string | null;
  @ApiProperty({ enum: [DeploymentStatus.ACTIVE] }) deploymentStatus!: DeploymentStatus;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) deployedAt!: Date | null;
}

export class ProjectSummaryResponseDto {
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ type: String, nullable: true }) summary!: string | null;
  @ApiProperty({ enum: ProjectStatus }) status!: ProjectStatus;
  @ApiProperty({ enum: ProjectType, nullable: true }) projectType!: ProjectType | null;
  @ApiProperty({ type: String, nullable: true }) coverImageUrl!: string | null;
  @ApiProperty() isFeatured!: boolean;
  @ApiProperty() sortOrder!: number;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) startedAt!: Date | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) completedAt!: Date | null;
  @ApiProperty({ type: [TechnologyResponseDto] }) technologies!: TechnologyResponseDto[];
}

export class ProjectDetailResponseDto extends ProjectSummaryResponseDto {
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, nullable: true }) problem!: string | null;
  @ApiProperty({ type: String, nullable: true }) solution!: string | null;
  @ApiProperty({ type: String, nullable: true }) architecture!: string | null;
  @ApiProperty({ type: String, nullable: true }) technicalChallenges!: string | null;
  @ApiProperty({ type: String, nullable: true }) repositoryUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) demoUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) documentationUrl!: string | null;
  @ApiProperty({ type: [ProjectMediaResponseDto] }) media!: ProjectMediaResponseDto[];
  @ApiProperty({ type: [ProjectDeploymentResponseDto] }) deployments!: ProjectDeploymentResponseDto[];
}

export class ExperienceResponseDto {
  @ApiProperty() organization!: string;
  @ApiProperty() position!: string;
  @ApiProperty({ enum: EmploymentType, nullable: true }) employmentType!: EmploymentType | null;
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) startedAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) endedAt!: Date | null;
  @ApiProperty() isCurrent!: boolean;
  @ApiProperty() sortOrder!: number;
}

export class EducationResponseDto {
  @ApiProperty() institution!: string;
  @ApiProperty() degree!: string;
  @ApiProperty({ type: String, nullable: true }) fieldOfStudy!: string | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) startedAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) completedAt!: Date | null;
}

export class CertificationResponseDto {
  @ApiProperty() name!: string;
  @ApiProperty() issuer!: string;
  @ApiProperty({ type: String, nullable: true }) credentialUrl!: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) issuedAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) expiresAt!: Date | null;
}

export class SecurityLabResponseDto {
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ type: String, nullable: true }) summary!: string | null;
  @ApiProperty({ enum: SecurityLabStatus }) status!: SecurityLabStatus;
}

export class SecurityLabDetailResponseDto extends SecurityLabResponseDto {
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, nullable: true }) methodology!: string | null;
  @ApiProperty({ type: [String] }) toolsUsed!: string[];
  @ApiProperty({ type: String, nullable: true }) remediation!: string | null;
  @ApiProperty({ type: String, nullable: true }) repositoryUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) reportUrl!: string | null;
}

export class PaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

export class ErrorDetailDto {
  @ApiProperty({ example: 'NOT_FOUND' }) code!: string;
  @ApiProperty({ example: 'Not found' }) message!: string;
}
export class ErrorResponseDto {
  @ApiProperty({ enum: ['error'] }) status!: string;
  @ApiProperty({ type: ErrorDetailDto }) error!: ErrorDetailDto;
}
