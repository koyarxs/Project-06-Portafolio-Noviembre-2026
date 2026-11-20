export type AssistantReply = { text: string; links?: readonly { label: string; href: string }[] };
export type AssistantTopic = { group: string; question: string; terms: readonly string[]; reply: AssistantReply };
export type AssistantProject = {
  name: string; alias: string; slug: string; description: string; technical: string; context: string;
  status: { id: string; label: string; newInPortfolio?: boolean };
  layers: readonly { label: string; technologies: readonly string[] }[];
  repository: string; private: boolean; site?: string; hasVideo: boolean;
};
export type AssistantKnowledge = {
  projects: readonly AssistantProject[];
  faqs: readonly { question: string; answer: string; href?: string }[];
  topics: readonly AssistantTopic[];
  profile: { name: string; github: string; linkedin: string };
};

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();
const contains = (text: string, term: string) => ` ${text} `.includes(` ${normalize(term)} `);
const detailUrl = (project: AssistantProject) => `/proyectos/destacados/${project.slug}`;
const projectLink = (project: AssistantProject, hash = '') => ({ label: project.name, href: detailUrl(project) + hash });
const contact = { label: 'Ir a Contacto', href: '/contacto' };
const portfolio = { label: 'Ver Portafolio Profesional', href: '/#portafolio' };
const stack = { label: 'Ver Mi stack', href: '/#stack' };
const profile = { label: 'Conocer a Yerko', href: '/sobre-mi' };
const faqLink = { label: 'Ver preguntas frecuentes', href: '/#preguntas-frecuentes' };

const faqTerms = [
  /servicios|que (?:tipo de proyectos|haces|desarrollas|ofreces)|integracion|saas|sistema a medida/,
  /idea|propuesta/,
  /sistema existente|sistemas existentes|mejorar mi|migracion/,
  /precio|cuanto cobra|cuanto cuesta|plazo|cotiz|presupuesto|cuanto demora/,
  /soporte|mantencion|mantenimiento|despues de entregar|entrega/,
  /ejemplos|trabajos/,
];

const technologyAliases: Record<string, string> = {
  'next js': 'Next.js', nextjs: 'Next.js', node: 'Node.js', nodejs: 'Node.js',
  nest: 'NestJS', postgres: 'PostgreSQL', tailwind: 'Tailwind CSS', django: 'Django',
  docker: 'Docker', ts: 'TypeScript', 'three js': 'Three.js', threejs: 'Three.js',
};

export function replyTo(input: string, knowledge: AssistantKnowledge, previousProject?: string): { reply: AssistantReply; project?: string; unmatched?: true } {
  const text = normalize(input);
  const { projects, faqs, profile: owner } = knowledge;
  const has = (pattern: RegExp) => pattern.test(text);
  if (has(/que (?:preguntas|te puedo preguntar|puedo preguntarte|puedes responder)|como (?:te )?uso|^ayuda$/)) {
    return { reply: {
      text: 'Puedes preguntarme por la historia de Yerko, sus trabajos, estudios y credenciales, los servicios de Veltrix o cualquiera de los proyectos. Por ejemplo: «¿Qué hizo en el Hospital Gustavo Fricke?», «¿Dónde estudió?» o «¿Qué proyectos usan PostgreSQL?». En Explorar preguntas tienes más ideas.',
      links: [profile, portfolio, faqLink],
    } };
  }
  const selectedFaq = faqs.find(faq => normalize(faq.question) === text);
  if (selectedFaq) return { reply: { text: selectedFaq.answer, links: selectedFaq.href ? [portfolio, faqLink] : [contact, faqLink] } };
  const named = projects.filter(project => [project.alias, project.name, project.slug,
    ...(project.slug === 'pawly' ? ['veterinaria', 'porvenir'] : project.slug === 'flymaster' ? ['fly master'] : [])].some(name => contains(text, name)));
  const followUp = /^(y |tambien |ese |esa |su |tiene |cual |con que |que (?:usa|stack|tecnologias))/.test(text);
  const mentioned = named.length ? named : followUp ? projects.filter(project => project.slug === previousProject) : [];
  const video = has(/\b(?:videos?|demos?|demostraciones?)\b/);
  const evidence = has(/\b(?:fotos?|capturas?|imagenes?|esquema)\b/);
  const tech = has(/\b(?:stack|tecnologias?|frontend|backend|orm|api|datos|librerias?|frameworks?)\b/);
  const github = has(/github|repositorio|codigo fuente/);
  const status = has(/estado|terminad|completad|pendient|desarrollo|publicad/);
  const site = has(/sitio|en linea|ver funcion|desplegad/);

  if (mentioned.length === 1) {
    const [project] = mentioned;
    let reply: AssistantReply = { text: `${project.description}\n\nEstado: ${project.status.label}.`, links: [projectLink(project)] };
    if (video) reply = {
      text: project.hasVideo ? `${project.name} tiene un recorrido grabado en su ficha.` :
        `El video de ${project.name} está pendiente. Puedes revisar la evidencia disponible en su ficha.`,
      links: [projectLink(project, project.hasVideo ? '#video' : '#capturas')],
    };
    else if (evidence) reply = { text: `Ve a la sección de evidencia de ${project.name} para revisar sus capturas o esquema técnico.`, links: [projectLink(project, '#capturas')] };
    else if (github) reply = { text: project.private ? `El repositorio de ${project.name} requiere acceso.` : `Repositorio de ${project.name}.`, links: [{ label: 'Abrir GitHub', href: project.repository }] };
    else if (tech) reply = { text: project.layers.map(layer => `${layer.label}: ${layer.technologies.join(', ')}`).join('\n\n'), links: [projectLink(project, '#tecnologias')] };
    else if (has(/como funciona|arquitectura|flujo|como (?:lo |se )?hic|implement/)) reply = {
      text: `${project.description}\n\n${project.technical}`, links: [projectLink(project, '#descripcion')],
    };
    else if (has(/para quien|a quien|cliente|equipo|usuarios?/)) reply = {
      text: `${project.description}\n\n${project.context}`, links: [projectLink(project, '#descripcion')],
    };
    else if (site) reply = project.site ? { text: `Puedes visitar ${project.name} aquí.`, links: [{ label: 'Abrir sitio', href: project.site }, projectLink(project)] } :
      { text: `La ficha de ${project.name} reúne su estado y evidencia disponible.`, links: [projectLink(project)] };
    else if (status) reply = { text: `${project.name}: ${project.status.label}.`, links: [projectLink(project)] };
    return { reply, project: project.slug };
  }
  if (mentioned.length > 1) return { reply: {
    text: mentioned.map(project => `${project.name} · ${project.status.label}\n${tech ? project.technical : project.description}`).join('\n\n'),
    links: mentioned.map(project => projectLink(project, tech ? '#tecnologias' : '')),
  } };

  const result = (text: string, links?: AssistantReply['links']) => ({ reply: { text, links } });
  if (has(/\b(?:cv|curriculum|hoja de vida)\b/)) return result('Puedes descargar el CV de Yerko Barrera y revisar su trayectoria.', [{ label: 'Descargar CV (PDF)', href: '/documents/Yerko-Barrera-CV.pdf' }, { label: 'Ver Trayectoria', href: '/experiencia' }]);
  if (has(/contact|correo|mail|whatsapp|cotiz|presupuesto|precio|plazo/)) {
    const faq = faqTerms[3].test(text) ? faqs[3] : undefined;
    return result(faq?.answer ?? 'Puedes contactar a Yerko por sus canales profesionales. En la página de Contacto están los enlaces disponibles.', [contact, { label: 'LinkedIn', href: owner.linkedin }]);
  }
  const exact = knowledge.topics.find(topic => normalize(topic.question) === text);
  const match = knowledge.topics.flatMap(topic => topic.terms
    .filter(term => contains(text, term))
    .map(term => ({ topic, weight: normalize(term).length })))
    .sort((first, second) => second.weight - first.weight)[0]?.topic;
  const topic = exact ?? match;
  if (topic) return { reply: topic.reply };
  if (has(/trayectoria|experiencia|estudios|certific|formacion|universidad|quien es yerko|sobre mi/)) return result('Yerko Barrera es Ingeniero en Computación e Informática. En Trayectoria puedes revisar su experiencia, formación y credenciales.', [{ label: 'Ver Trayectoria', href: '/experiencia' }, profile]);
  if (video || evidence) {
    const available = video ? projects.filter(project => project.hasVideo) : projects;
    return result(video ? `Hay ${available.length} recorridos en video disponibles.` : 'Las fichas reúnen capturas y esquemas técnicos de los proyectos.', available.map(project => projectLink(project, video ? '#video' : '#capturas')));
  }
  if (status || has(/\bnuevos?\b/)) {
    const id = has(/terminad|completad|publicad/) ? 'complete' : has(/pendient/) ? 'pending' : has(/desarrollo/) ? 'development' : '';
    const available = has(/\bnuevos?\b/) ? projects.filter(project => project.status.newInPortfolio) : projects.filter(project => !id || project.status.id === id);
    return result(available.length ? available.map(project => `• ${project.name} · ${project.status.label}`).join('\n') : 'Actualmente no hay proyectos en esa categoría.', available.length ? available.map(project => projectLink(project)) : [portfolio]);
  }

  const matched = projects.flatMap(project => project.layers.flatMap(layer => layer.technologies))
    .map(name => normalize(name).replace(/\s+\d+(?:\s+\d+)*$/, ''));
  const requested = [...new Set([...Object.keys(technologyAliases), ...matched])]
    .filter(term => term.length >= 2 && contains(text, term))
    .sort((first, second) => second.length - first.length)[0];
  if (requested) {
    const target = normalize(technologyAliases[requested] ?? requested);
    const usedIn = projects.filter(project => project.layers.some(layer => layer.technologies.some(name => contains(normalize(name), target))));
    if (usedIn.length) return result(`Tecnología documentada en ${usedIn.length} proyecto${usedIn.length === 1 ? '' : 's'}. Puedes revisar el stack completo de cada uno aquí.`, usedIn.map(project => projectLink(project, '#tecnologias')));
  }
  if (tech) return result('Mi stack reúne frontend, backend, bases de datos, pruebas, DevOps, seguridad, herramientas y cloud. Las fichas indican qué tecnologías usa cada proyecto.', [stack, portfolio]);
  if (github) return result('En GitHub puedes revisar los repositorios públicos de Yerko y, en Portafolio, encontrar el enlace de cada proyecto.', [{ label: 'GitHub de Yerko', href: owner.github }, portfolio]);
  if (has(/linkedin|redes sociales/)) return result('Puedes encontrar a Yerko en LinkedIn y GitHub.', [{ label: 'LinkedIn', href: owner.linkedin }, { label: 'GitHub', href: owner.github }]);
  const faqIndex = faqTerms.findIndex(pattern => pattern.test(text));
  const faq = faqs[faqIndex];
  if (faq) return result(faq.answer, faq.href ? [{ label: 'Ver proyectos', href: faq.href }] : [contact, faqLink]);
  if (has(/proyectos|portafolio|portfolio/)) return result(`Puedes explorar ${projects.length} proyectos. ¿Cuál te interesa?`, projects.map(project => projectLink(project)));
  if (has(/^(?:hola|buenas|buenos dias|buenas tardes|hey)(?:\s|$)/)) return result('¡Hola! Pregúntame por un proyecto, una tecnología, los videos disponibles o el CV de Yerko.', [portfolio, stack]);
  return { ...result('No encontré una respuesta para esa pregunta en el portafolio. Prueba con el nombre de un proyecto o una tecnología. Si necesitas conversar sobre algo específico, puedes escribirle a Yerko.', [portfolio, faqLink, contact]), unmatched: true };
}
