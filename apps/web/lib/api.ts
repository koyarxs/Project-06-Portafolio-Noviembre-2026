import 'server-only';
import { cache } from 'react';
import { certificationSchema, educationSchema, experienceSchema, itemSchema, labDetailSchema, labSchema, pageSchema, profileSchema, projectDetailSchema, projectSchema, technologySchema } from './contracts';

export type Result<T> = { status: 'ok'; data: T } | { status: 'missing' } | { status: 'unavailable'; reason: 'network' | 'rate-limit' | 'invalid' };
const base = (process.env.PORTFOLIO_API_URL ?? 'http://127.0.0.1:3001/api/v1').replace(/\/$/, '');

async function read<T>(path: string, guard: (value: unknown) => value is T): Promise<Result<T>> {
  try {
    const response = await fetch(`${base}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(4_000), headers: { Accept: 'application/json' } });
    if (response.status === 404) return { status: 'missing' };
    if (!response.ok) return { status: 'unavailable', reason: response.status === 429 ? 'rate-limit' : 'network' };
    const data: unknown = await response.json();
    return guard(data) ? { status: 'ok', data } : { status: 'unavailable', reason: 'invalid' };
  } catch { return { status: 'unavailable', reason: 'network' }; }
}
export const getProfile = cache(() => read('/profile', itemSchema(profileSchema)));
export const getProjects = cache((query = 'limit=6') => read(`/projects?${query}`, pageSchema(projectSchema)));
export const getProject = cache((slug: string) => read(`/projects/${encodeURIComponent(slug)}`, itemSchema(projectDetailSchema)));
export const getTechnologies = cache(() => read('/technologies?limit=100', pageSchema(technologySchema)));
export const getExperience = cache((page = 1) => read(`/experience?limit=10&page=${page}`, pageSchema(experienceSchema)));
export const getEducation = cache((page = 1) => read(`/education?limit=10&page=${page}`, pageSchema(educationSchema)));
export const getCertifications = cache((page = 1) => read(`/certifications?limit=10&page=${page}`, pageSchema(certificationSchema)));
export const getLabs = cache((page = 1) => read(`/security-labs?limit=10&page=${page}`, pageSchema(labSchema)));
export const getLab = cache((slug: string) => read(`/security-labs/${encodeURIComponent(slug)}`, itemSchema(labDetailSchema)));
