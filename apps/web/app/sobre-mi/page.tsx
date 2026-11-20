import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '../../components/icons';
import { ExternalLink } from '../../components/ui';
import { getProfile } from '../../lib/api';
import { owner, publicWork } from '../../lib/owner';
import { pageMetadata } from '../../lib/seo';
import styles from './about.module.css';

export const metadata = pageMetadata('Sobre mí', 'Perfil profesional de Yerko Barrera, ingeniero en Computación e Informática y desarrollador Full Stack.', '/sobre-mi');

const icons = {
  workflow: 'M3 5h7v5H3zM14 14h7v5h-7zM7 10v7h7m-3-3 3 3-3 3',
  access: 'M12 3l8 3v5c0 4-2.5 7-8 10-5.5-3-8-6-8-10V6l8-3Zm-3 9 2 2 4-4',
  data: 'M5 19V9m7 10V5m7 14v-7M3 19h18',
  download: 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',
};

const approach = [
  { icon: 'workflow', title: 'Diseñar desde el flujo de trabajo', project: 'Pawly', slug: 'pawly',
    description: 'En Pawly, el proceso parte de una necesidad concreta: reservar una consulta. El portal reúne la solicitud de cita y la consulta de disponibilidad, mientras la agenda interna ayuda al equipo a coordinar la atención.' },
  { icon: 'access', title: 'Definir quién puede hacer qué', project: 'Zenvik', slug: 'zenvik',
    description: 'En Zenvik, trabajadores, turnos y permisos se organizan por negocio. La API limita las consultas según la membresía y el rol de cada persona.' },
  { icon: 'data', title: 'Hacer que los resultados se puedan revisar', project: 'FraudShield', slug: 'fraudshield',
    description: 'FraudShield, mi proyecto de título, procesa transacciones CSV y aplica reglas para clasificarlas según su riesgo. El flujo conserva la trazabilidad para apoyar la revisión.' },
] as const;

function AboutIcon({ kind }: { kind: keyof typeof icons }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[kind]} /></svg>;
}

export default async function AboutPage() {
  const result = await getProfile();
  const profile = result.status === 'ok' ? result.data.data : null;
  const name = profile?.fullName ?? owner.name;
  const availability = profile?.availabilityStatus === 'AVAILABLE' ? 'Disponible para nuevos proyectos' :
    profile?.availabilityStatus === 'OPEN_TO_OPPORTUNITIES' ? 'Abierto a oportunidades' : null;

  return <div className={styles.page}>
    <header className={styles.banner}>
      <div className={`${styles.width} ${styles.hero}`}>
        <div className={styles.intro}>
          <h1>Sobre mí</h1>
          <p className={styles.name}>{name}</p>
          <p>Desarrollo aplicaciones web y sistemas de gestión. Me interesa convertir tareas como reservar, coordinar equipos o revisar datos en procesos que las personas puedan seguir y entender.</p>
          <div className={styles.actions}>
            <Link href="/#portafolio" className={styles.primary}>Ver proyectos <Arrow /></Link>
            <a href="/documents/Yerko-Barrera-CV.pdf" download="CV-Yerko-Barrera.pdf" className={styles.download}>
              <AboutIcon kind="download" /> Descargar CV
            </a>
          </div>
        </div>
        <figure className={styles.visual}>
          <Image src="/images/yerko-linkedin.jpg" alt={`Retrato de ${name}`} width={400} height={400}
            sizes="(max-width: 700px) 156px, 252px" preload />
        </figure>
      </div>
    </header>

    <div className={styles.width}>
      <section className={styles.section} aria-labelledby="quien-soy">
        <h2 id="quien-soy">Quién soy</h2>
        <div className={styles.copy}>
          <p>Soy Ingeniero en Computación e Informática y Licenciado en Ingeniería por la Universidad Andrés Bello. Mi experiencia en soporte TI me enseñó a entender las incidencias desde el punto de vista de quien necesita seguir trabajando.</p>
          <p>Hoy aplico esa perspectiva al desarrollo Full Stack. Conecto la interfaz, la API y los datos para construir aplicaciones que respondan a necesidades concretas.</p>
          {(profile?.location || availability) && <p className={styles.profileMeta}>
            {[profile?.location, availability].filter(Boolean).join(' · ')}
          </p>}
          <div className={styles.links}>
            <Link href="/experiencia">Ver mi trayectoria <Arrow /></Link>
            <ExternalLink href={profile?.githubUrl ?? owner.github}>GitHub</ExternalLink>
            <ExternalLink href={profile?.linkedinUrl ?? owner.linkedin}>LinkedIn</ExternalLink>
            <ExternalLink href={profile?.resumeUrl}>Currículum</ExternalLink>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.workSection}`} aria-labelledby="como-trabajo">
        <h2 id="como-trabajo">Cómo trabajo</h2>
        <div>
          <ol className={styles.approach}>
            {approach.map(item => {
              const project = publicWork.find(project => project.slug === item.slug);
              return <li key={item.slug} className={styles.copy} data-project={item.slug}>
                {item.slug === 'fraudshield' ?
                  <div className={`${styles.evidence} ${styles.riskFlow}`}>
                    <span>Esquema técnico</span>
                    <p>CSV <Arrow /> Reglas <Arrow /> Riesgo</p>
                  </div> : project && <div className={styles.evidence}>
                    <Image src={project.image} fill sizes="(max-width: 640px) 90vw, (max-width: 900px) 45vw, 320px"
                      alt={`Captura de la interfaz de ${item.project}`} />
                  </div>}
                <h3><span className={styles.approachIcon}><AboutIcon kind={item.icon} /></span>{item.title}</h3>
                <p>{item.description}</p>
                <Link className={styles.textLink} href={`/proyectos/destacados/${item.slug}`}>Ver {item.project} <Arrow /></Link>
              </li>;
            })}
          </ol>
          <Link className={styles.textLink} href="/#stack">Ver mi stack técnico <Arrow /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.veltrixSection}`} aria-labelledby="que-construyo">
        <h2 id="que-construyo">Qué estoy construyendo</h2>
        <div className={styles.copy}>
          <h3><Image src="/images/career/veltrix.jpg" alt="" width={38} height={38} /> YB Veltrix Solutions</h3>
          <p>Fundé Veltrix para desarrollar aplicaciones web, plataformas SaaS y soluciones a medida. Es el espacio donde reúno el diseño del producto y el trabajo de ingeniería, desde entender el problema hasta implementar la solución.</p>
          <Link href="/contacto" className={styles.textLink}>Conversemos sobre tu proyecto <Arrow /></Link>
        </div>
      </section>
    </div>
  </div>;
}
