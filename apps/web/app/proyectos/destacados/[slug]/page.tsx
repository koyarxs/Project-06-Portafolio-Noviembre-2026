import { notFound } from 'next/navigation';
import { FeaturedProjectPage, featuredProjects } from '../../../../components/public-work';
import { pageMetadata } from '../../../../lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return featuredProjects.map(({ slug }) => ({ slug }));
}

async function getFeaturedProject(params: Props['params']) {
  const { slug } = await params;
  const project = featuredProjects.find(item => item.slug === slug);
  if (!project) notFound();
  return project;
}

export async function generateMetadata({ params }: Props) {
  const project = await getFeaturedProject(params);
  return pageMetadata(project.name, project.description, `/proyectos/destacados/${project.slug}`);
}

export default async function Page({ params }: Props) {
  return <FeaturedProjectPage project={await getFeaturedProject(params)} />;
}
