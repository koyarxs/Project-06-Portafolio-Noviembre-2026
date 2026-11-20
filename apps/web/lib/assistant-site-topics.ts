import { careerCertifications, careerEducation, careerExperience, founder } from './career';
import { professionalBiography, technologyGroups, cloudPlatforms } from './professional-profile';
import { services } from './portfolio-services';
import type { AssistantTopic } from './assistant-replies';

const careerLink = { label: 'Ver Trayectoria', href: '/experiencia' };
const profileLink = { label: 'Conocer a Yerko', href: '/sobre-mi' };
const stackLink = { label: 'Ver Mi stack', href: '/#stack' };
const servicesLink = { label: 'Ver Servicios', href: '/servicios' };
const contactLink = { label: 'Ir a Contacto', href: '/contacto' };

export const assistantSiteTopics: readonly AssistantTopic[] = [
  {
    group: 'Historia y trayectoria', question: '¿Cuál es la historia profesional de Yerko?',
    terms: ['historia profesional', 'historia de yerko', 'biografia', 'cuentame tu historia', 'tu historia', 'quien eres', 'quien es yerko', 'desde soporte', 'como empezaste', 'hablame de ti', 'sobre mi'],
    reply: {
      text: `Yerko comenzó con formación en programación en AIEP. Su recorrido en TI incluye soporte en educación y salud, infraestructura y desarrollo de software. Actualmente combina ingeniería de software con el desarrollo Full Stack y lidera YB Veltrix Solutions.\n\n${professionalBiography[0]}`,
      links: [profileLink, careerLink],
    },
  },
  {
    group: 'Historia y trayectoria', question: '¿Dónde ha trabajado Yerko?',
    terms: ['donde ha trabajado', 'donde trabajaste', 'experiencia laboral', 'historial laboral', 'trabajos anteriores', 'cargos anteriores', 'trayectoria'],
    reply: {
      text: [`• ${founder.company} · ${founder.role} (${founder.period})`, ...careerExperience.map(role => `• ${role.company} · ${role.role} (${role.period})`)].join('\n'),
      links: [{ label: 'Ver experiencia y responsabilidades', href: '/experiencia#experiencia' }],
    },
  },
  {
    group: 'Historia y trayectoria', question: '¿En qué trabaja Yerko actualmente?',
    terms: ['en que trabaja', 'en que trabajas', 'trabajo actual', 'cargos actuales', 'a que te dedicas'],
    reply: {
      text: `La trayectoria publicada registra a Yerko como ${founder.role} de ${founder.company} (${founder.period}) y ${careerExperience[0].role} en ${careerExperience[0].company} (${careerExperience[0].period}). ${careerExperience[0].summary}`,
      links: [careerLink, profileLink],
    },
  },
  ...careerExperience.map(role => ({
    group: 'Historia y trayectoria', question: `¿Qué hizo Yerko en ${role.company}?`,
    terms: [role.company, ...({
      outlier: ['Outlier', 'revisión de código generado por IA'],
      reimpact: ['Reimpact'],
      belator: ['Belator'],
      'tic-services': ['TIC Services', 'Gustavo Fricke', 'soporte hospitalario'],
      nutech: ['Nutech', 'HyFlex', 'soporte a docentes'],
    }[role.id])],
    reply: {
      text: `${role.role} en ${role.company} (${role.period}). ${role.summary}\n\n${role.responsibilities.slice(0, 3).map(item => `• ${item}`).join('\n')}`,
      links: [{ label: 'Ver experiencia', href: '/experiencia#experiencia' }],
    },
  })),
  {
    group: 'Formación y credenciales', question: '¿Qué estudió Yerko y dónde?',
    terms: ['que estudio', 'que estudiaste', 'donde estudio', 'donde estudiaste', 'estudios', 'formacion academica', 'aiep', 'unab', 'universidad andres bello', 'licenciado en ingenieria', 'titulo profesional'],
    reply: {
      text: careerEducation.map(education => `${education.institution} · ${education.degree} (${education.period}). ${education.detail}`).join('\n\n'),
      links: [{ label: 'Ver formación', href: '/experiencia#formacion' }],
    },
  },
  {
    group: 'Formación y credenciales', question: '¿Qué credenciales tiene Yerko?',
    terms: ['credenciales', 'certificados', 'certificaciones', 'certificado', 'certificacion', 'cursos completados'],
    reply: {
      text: `La galería de Trayectoria documenta ${careerCertifications.length} credenciales, entre ellas:\n${careerCertifications.slice(0, 5).map(item => `• ${item.name} (${item.issued})`).join('\n')}`,
      links: [{ label: 'Ver galería de credenciales', href: '/experiencia#credenciales' }],
    },
  },
  {
    group: 'Veltrix y servicios', question: '¿Qué es YB Veltrix Solutions?',
    terms: ['yb veltrix solutions', 'veltrix solutions', 'quien fundo veltrix', 'cuando fundaste', 'fundador de veltrix', 'quien fundo', 'tu empresa', 'tu marca', 'que es veltrix'],
    reply: {
      text: `Yerko es ${founder.role} de ${founder.company} desde julio de 2025. ${founder.description}`,
      links: [{ label: 'Ver Liderazgo', href: '/experiencia#liderazgo' }, servicesLink],
    },
  },
  {
    group: 'Veltrix y servicios', question: '¿Qué servicios ofrece Veltrix?',
    terms: ['que servicios', 'servicios de veltrix', 'servicios ofrece', 'servicios ofreces'],
    reply: { text: services.map(([, , title, description]) => `${title}. ${description}`).join('\n\n'), links: [servicesLink, contactLink] },
  },
  ...services.map(([id, , title, description]) => ({
    group: 'Veltrix y servicios', question: `¿Qué incluye ${title.toLowerCase()}?`,
    terms: [title],
    reply: { text: description, links: [{ label: title, href: `/servicios#${id}` }, contactLink] },
  })),
  {
    group: 'Veltrix y servicios', question: '¿Cómo trabaja Yerko en un proyecto?',
    terms: ['como trabajas', 'como trabaja yerko', 'proceso de trabajo', 'metodologia de trabajo', 'como empiezas un proyecto'],
    reply: { text: `Su recorrido abarca requerimientos, diseño técnico, implementación, integración, pruebas y despliegue. ${professionalBiography[2]}`,
      links: [profileLink, servicesLink, contactLink] },
  },
  {
    group: 'Tecnologías y laboratorios', question: '¿Qué plataformas cloud aparecen en el sitio?',
    terms: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'computacion en la nube'],
    reply: { text: `El perfil documenta estos usos previstos para plataformas cloud:\n${cloudPlatforms.map(platform => `• ${platform.name}. ${platform.plannedUse}`).join('\n')}`, links: [stackLink] },
  },
  ...technologyGroups.map(group => ({
    group: 'Tecnologías y laboratorios', question: `¿Qué usa Yerko en ${group.title}?`,
    terms: [`que usa en ${group.title}`, `tecnologias de ${group.title}`, `herramientas de ${group.title}`],
    reply: { text: group.detail, links: [stackLink] },
  })),
  {
    group: 'Tecnologías y laboratorios', question: '¿Qué hay en Laboratorios?',
    terms: ['laboratorios', 'laboratorios de seguridad', 'laboratorio de ciberseguridad', 'practica de seguridad'],
    reply: { text: 'Laboratorios reúne documentación pública de prácticas autorizadas en seguridad, como metodología y medidas de mitigación cuando están disponibles.', links: [{ label: 'Ver Laboratorios', href: '/laboratorios' }] },
  },
];
