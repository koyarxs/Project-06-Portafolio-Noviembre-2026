import { getProfile } from '../../lib/api';
import { owner } from '../../lib/owner';
import { safeUrl } from '../../lib/presentation';
import { pageMetadata } from '../../lib/seo';
import { ExternalLink, PageIntro } from '../../components/ui';

export const metadata = pageMetadata('Contacto', 'Canales profesionales públicos para conversar sobre desarrollo Full Stack e ingeniería de software.', '/contacto');
export default async function ContactPage() {
  const result = await getProfile();
  const profile = result.status === 'ok' ? result.data.data : null;
  const available = profile && (safeUrl(profile.githubUrl) || safeUrl(profile.linkedinUrl));
  return <div className="site-width"><PageIntro label="Contacto profesional" title="Una conversación puede abrir caminos." description="Para hablar de software, intercambiar ideas o explorar una oportunidad profesional, estos son los canales disponibles." /><div className="page-content contact-layout"><div><p className="eyebrow mb-5">CONECTEMOS</p><p className="text-muted max-w-md">Elige el canal que te resulte más cómodo. Aquí encontrarás únicamente los enlaces profesionales compartidos públicamente.</p>{profile?.fullName && <p className="text-lg mt-8">{profile.fullName}</p>}{profile?.location && <p className="text-xs text-muted mt-2">{profile.location}</p>}</div><div>{!available ? <div className="contact-links"><ExternalLink href={owner.github}>GitHub</ExternalLink><ExternalLink href={owner.linkedin}>LinkedIn</ExternalLink></div> : <div className="contact-links"><ExternalLink href={profile.githubUrl}>GitHub</ExternalLink><ExternalLink href={profile.linkedinUrl}>LinkedIn</ExternalLink></div>}{profile?.resumeUrl && <div className="mt-8"><ExternalLink href={profile.resumeUrl}>Consultar currículum</ExternalLink></div>}</div></div></div>;
}
