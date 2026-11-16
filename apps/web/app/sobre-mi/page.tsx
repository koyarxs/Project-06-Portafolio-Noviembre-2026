import { getProfile } from '../../lib/api';
import { TechnologyEntry } from '../../components/technology-stack';
import { mainStack } from '../../lib/presentation';
import { professionalBiography, technologyGroups, cloudPlatforms } from '../../lib/professional-profile';
import { pageMetadata } from '../../lib/seo';
import { PageIntro, SectionHeading, SocialLinks } from '../../components/ui';

export const metadata = pageMetadata('Sobre mí', 'Perfil profesional y especialización en desarrollo Full Stack e ingeniería de software.', '/sobre-mi');
export default async function AboutPage() {
  const result = await getProfile();
  const profile = result.status === 'ok' ? result.data.data : null;
  return <div className="site-width"><PageIntro label="Perfil profesional" title={profile?.fullName ?? 'Una perspectiva Full Stack.'} description={'Ingeniero en Computación e Informática · Licenciado en Ingeniería · Full Stack Developer'} /><div className="page-content">
    <div className="profile-grid"><aside className="profile-side"><p className="eyebrow">ESPECIALIZACIÓN</p><h2>Desarrollo<br /><span className="serif">Full Stack.</span></h2><p>{mainStack.join(' · ')}</p>{profile?.location && <p className="mt-5">{profile.location}</p>}{profile?.availabilityStatus === 'AVAILABLE' && <p className="mt-4">Disponible para nuevos proyectos</p>}{profile?.availabilityStatus === 'OPEN_TO_OPPORTUNITIES' && <p className="mt-4">Abierto a oportunidades</p>}<SocialLinks profile={profile} /></aside><div><div className="prose-text">{professionalBiography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div></div>
    <section className="mt-20"><SectionHeading number="01" label="Caja de herramientas" title="Tecnologías y fundamentos." description="Un catálogo organizado por su papel en el desarrollo de software, sin porcentajes ni niveles inventados." /><div className="technology-groups">{technologyGroups.map(group => <section className="technology-group" key={group.number}><h3>{group.title}</h3><ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{group.names.map(name => <TechnologyEntry key={name} name={name} />)}</ul></section>)}<section className="technology-group"><h3>Cloud</h3><ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{cloudPlatforms.map(cloud => <TechnologyEntry key={cloud.short} name={cloud.name} description={cloud.plannedUse} />)}</ul></section></div></section>
  </div></div>;
}
