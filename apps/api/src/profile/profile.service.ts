import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.ts';
import type { ProfileResponseDto } from '../common/public-response.dto.ts';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async get(): Promise<ProfileResponseDto> {
    const profile = await this.prisma.client.profile.findUnique({ where: { singleton: true }, select: {
      fullName: true, professionalTitle: true, headline: true, biography: true, location: true,
      githubUrl: true, linkedinUrl: true, resumeUrl: true, availabilityStatus: true,
    } });
    if (!profile) throw new NotFoundException();
    return profile;
  }
}
