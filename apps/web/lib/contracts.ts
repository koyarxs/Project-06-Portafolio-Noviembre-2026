// Contratos JSON de la API pública. Las fechas viajan como ISO 8601, no como Date.
type Guard<T> = (value: unknown) => value is T;
export type Infer<G> = G extends Guard<infer T> ? T : never;
const text: Guard<string> = (v): v is string => typeof v === 'string';
const bool: Guard<boolean> = (v): v is boolean => typeof v === 'boolean';
const number: Guard<number> = (v): v is number => typeof v === 'number' && Number.isFinite(v);
const nullable = <T>(guard: Guard<T>): Guard<T | null> => (v): v is T | null => v === null || guard(v);
const array = <T>(guard: Guard<T>): Guard<T[]> => (v): v is T[] => Array.isArray(v) && v.every(guard);
const object = <S extends Record<string, Guard<unknown>>>(shape: S): Guard<{ [K in keyof S]: Infer<S[K]> }> =>
  (value): value is { [K in keyof S]: Infer<S[K]> } => typeof value === 'object' && value !== null &&
    Object.entries(shape).every(([key, guard]) => guard((value as Record<string, unknown>)[key]));
const enumeration = <const T extends readonly string[]>(values: T): Guard<T[number]> =>
  (value): value is T[number] => typeof value === 'string' && values.includes(value);

export const projectStatuses = ['PLANNED', 'IN_DEVELOPMENT', 'DEMO_AVAILABLE', 'COMPLETED', 'ARCHIVED'] as const;
export type ProjectStatus = typeof projectStatuses[number];
export const categories = ['FRONTEND', 'BACKEND', 'DATABASE', 'ORM', 'DEVOPS', 'CLOUD', 'TESTING', 'SECURITY', 'MOBILE', 'TOOLS'] as const;
export const technologySchema = object({ name: text, slug: text, category: enumeration(categories), description: nullable(text), iconUrl: nullable(text), websiteUrl: nullable(text), isFeatured: bool, sortOrder: number });
export type Technology = Infer<typeof technologySchema>;
const projectFields = {
  name: text, slug: text, summary: nullable(text), status: enumeration(projectStatuses),
  projectType: nullable(enumeration(['PERSONAL', 'COMMERCIAL', 'SAAS', 'ACADEMIC', 'OPEN_SOURCE', 'LABORATORY'])),
  coverImageUrl: nullable(text), isFeatured: bool, sortOrder: number,
  startedAt: nullable(text), completedAt: nullable(text), technologies: array(technologySchema),
};
export const projectSchema = object(projectFields);
export type Project = Infer<typeof projectSchema>;
export const projectDetailSchema = object({ ...projectFields,
  description: nullable(text), problem: nullable(text), solution: nullable(text), architecture: nullable(text),
  technicalChallenges: nullable(text), repositoryUrl: nullable(text), demoUrl: nullable(text), documentationUrl: nullable(text),
  media: array(object({ mediaType: enumeration(['IMAGE', 'VIDEO', 'DIAGRAM']), url: text, altText: nullable(text), caption: nullable(text), sortOrder: number })),
  deployments: array(object({ provider: text, deploymentUrl: nullable(text), deploymentStatus: enumeration(['ACTIVE']), deployedAt: nullable(text) })),
});
export type ProjectDetail = Infer<typeof projectDetailSchema>;
export const profileSchema = object({ fullName: text, professionalTitle: text, headline: nullable(text), biography: nullable(text), location: nullable(text), githubUrl: nullable(text), linkedinUrl: nullable(text), resumeUrl: nullable(text), availabilityStatus: enumeration(['AVAILABLE', 'OPEN_TO_OPPORTUNITIES', 'UNAVAILABLE']) });
export type Profile = Infer<typeof profileSchema>;
export const experienceSchema = object({ organization: text, position: text, employmentType: nullable(text), location: nullable(text), description: nullable(text), startedAt: text, endedAt: nullable(text), isCurrent: bool, sortOrder: number });
export type Experience = Infer<typeof experienceSchema>;
export const educationSchema = object({ institution: text, degree: text, fieldOfStudy: nullable(text), description: nullable(text), startedAt: text, completedAt: nullable(text) });
export const certificationSchema = object({ name: text, issuer: text, credentialUrl: nullable(text), issuedAt: text, expiresAt: nullable(text) });
export const labSchema = object({ title: text, slug: text, summary: nullable(text), status: enumeration(['PLANNED', 'IN_PROGRESS', 'COMPLETED']) });
export const labDetailSchema = object({ title: text, slug: text, summary: nullable(text), status: enumeration(['PLANNED', 'IN_PROGRESS', 'COMPLETED']), description: nullable(text), methodology: nullable(text), toolsUsed: array(text), remediation: nullable(text), repositoryUrl: nullable(text), reportUrl: nullable(text) });
export type Lab = Infer<typeof labDetailSchema>;
export const metaSchema = object({ page: number, limit: number, total: number, totalPages: number });
export const pageSchema = <T>(guard: Guard<T>) => object({ data: array(guard), meta: metaSchema });
export const itemSchema = <T>(guard: Guard<T>) => object({ data: guard });
export type Page<T> = { data: T[]; meta: Infer<typeof metaSchema> };
