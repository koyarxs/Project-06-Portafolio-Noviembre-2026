// Fixtures exclusivas de pruebas. Nunca se importan desde app/, components/ ni lib/.
import type { Profile, ProjectDetail, Technology } from '../lib/contracts';
export const technology: Technology = { name: 'TypeScript', slug: 'typescript', category: 'TOOLS', description: null, iconUrl: null, websiteUrl: null, isFeatured: false, sortOrder: 0 };
export const profile: Profile = { fullName: 'Perfil de prueba', professionalTitle: 'Título de prueba', headline: null, biography: 'Biografía controlada de pruebas.', location: null, githubUrl: 'https://github.com/example', linkedinUrl: null, resumeUrl: null, availabilityStatus: 'UNAVAILABLE' };
export const project: ProjectDetail = {
  name: 'Proyecto de prueba Alfa', slug: 'proyecto-prueba-alfa', summary: 'Resumen controlado de pruebas.',
  status: 'IN_DEVELOPMENT', projectType: 'LABORATORY', coverImageUrl: null, isFeatured: true, sortOrder: 0,
  startedAt: null, completedAt: null, technologies: [technology], description: 'Contexto de prueba.',
  problem: 'Problema de prueba.', solution: 'Solución de prueba.', architecture: 'Arquitectura de prueba.',
  technicalChallenges: 'Desafío de prueba.', repositoryUrl: 'https://github.com/example/test',
  demoUrl: 'https://example.invalid/demo-no-verificada', documentationUrl: null,
  media: [{ mediaType: 'DIAGRAM', url: 'https://example.invalid/diagrama', altText: 'Diagrama de prueba', caption: 'Arquitectura de prueba', sortOrder: 0 }],
  deployments: [{ provider: 'OTHER', deploymentUrl: 'https://example.invalid/no-verificado', deploymentStatus: 'ACTIVE', deployedAt: null }],
};
