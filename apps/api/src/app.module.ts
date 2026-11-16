import { CommunityThrottlerGuard } from './community/community-auth.ts';
import { CommunityModule } from './community/community.module.ts';
import { VisitorsModule } from './visitors/visitors.module.ts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { environmentFiles, validateEnvironment } from './config/environment.ts';
import { HealthModule } from './health/health.module.ts';
import { ProfileModule } from './profile/profile.module.ts';
import { ProjectsModule } from './projects/projects.module.ts';
import { TechnologiesModule } from './technologies/technologies.module.ts';
import { ExperienceModule } from './experience/experience.module.ts';
import { EducationModule } from './education/education.module.ts';
import { CertificationsModule } from './certifications/certifications.module.ts';
import { SecurityLabsModule } from './security-labs/security-labs.module.ts';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath: environmentFiles(), validate: validateEnvironment }),
    ThrottlerModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => [
      { ttl: 60_000, limit: config.getOrThrow<number>('API_RATE_LIMIT') },
    ] }),
    HealthModule, VisitorsModule, CommunityModule,
    ProfileModule, ProjectsModule, TechnologiesModule, ExperienceModule,
    EducationModule, CertificationsModule, SecurityLabsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: CommunityThrottlerGuard }],
})
export class AppModule {}
