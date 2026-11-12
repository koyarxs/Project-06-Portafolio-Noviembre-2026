import { getProfile, getTechnologies } from '../../lib/api';
import { mainStack } from '../../lib/presentation';
import { pageMetadata } from '../../lib/seo';
import { EmptyState, PageIntro, SectionHeading, SocialLinks, Unavailable } from '../../components/ui';

export const metadata = pageMetadata('Sobre mí', 'Perfil profesional y especialización en desarrollo Full Stack e ingeniería de software.', '/sobre-mi');
const categoryLabels: Record<string, string> = { FRONTEND: 'Interfaces', BACKEND: 'Backend', DATABASE: 'Bases de datos', ORM: 'Persistencia', DEVOPS: 'Entrega y operaciones', CLOUD: 'Cloud', TESTING: 'Calidad y pruebas', SECURITY: 'Seguridad', MOBILE: 'Mobile', TOOLS: 'Herramientas' };
export default async function AboutPage() {
  const [result, technologies] = await Promise.all([getProfile(), getTechnologies()]);
  const profile = result.status === 'ok' ? result.data.data : null;
  const groups = technologies.status === 'ok' ? Object.groupBy(technologies.data.data.filter(item => item.slug !== 'angular' && !/^angular(?:js)?$/i.test(item.name.trim())), item => item.category) : {};
  return <div className="site-width"><PageIntro label="Perfil profesional" title={profile?.fullName ?? 'Una perspectiva Full Stack.'} description={profile?.professionalTitle ?? 'Ingeniería en Computación e Informática, con especialización en desarrollo Full Stack.'} /><div className="page-content">
    <div className="profile-grid"><aside className="profile-side"><p className="eyebrow">ESPECIALIZACIÓN</p><h2>Desarrollo<br /><span className="serif">Full Stack.</span></h2><p>{mainStack.join(' · ')}</p>{profile?.location && <p className="mt-5">{profile.location}</p>}{profile?.availabilityStatus === 'AVAILABLE' && <p className="mt-4">Disponible para nuevos proyectos</p>}{profile?.availabilityStatus === 'OPEN_TO_OPPORTUNITIES' && <p className="mt-4">Abierto a oportunidades</p>}<SocialLinks profile={profile} /></aside><div>{result.status === 'unavailable' ? <Unavailable /> : profile?.biography ? <div className="prose-text">{profile.biography}</div> : <EmptyState title="El perfil, con sus propias palabras.">La información profesional se mostrará en este espacio cuando esté disponible.</EmptyState>}</div></div>
    <section className="mt-20"><SectionHeading number="01" label="Caja de herramientas" title="Tecnologías y fundamentos." description="Un catálogo organizado por su papel en el desarrollo de software, sin porcentajes ni niveles inventados." />{technologies.status !== 'ok' ? <Unavailable /> : technologies.data.data.length ? <div className="technology-groups">{Object.entries(groups).map(([category, items]) => <section className="technology-group" key={category}><h3>{categoryLabels[category] ?? category}</h3><div className="tags">{items?.map(item => <span key={item.slug}>{item.name}</span>)}</div></section>)}</div> : <EmptyState title="Las herramientas también cuentan una historia.">Las tecnologías del perfil se mostrarán aquí cuando estén disponibles.</EmptyState>}</section>
  </div></div>;
}
