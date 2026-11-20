import type { publicWork } from './owner';

export type FeaturedSlug = (typeof publicWork)[number]['slug'] | 'flymaster' | 'portafolio-profesional';

type ProjectStory = {
  pitch: string;
  contextLabel: string;
  context: string;
  technical: string;
  technologies: readonly { label: string; technologies: readonly string[] }[];
  technologyNote?: string;
  cover: { image?: string; title: string; caption: string; width: number; height: number };
};

export const projectStories: Record<FeaturedSlug, ProjectStory> = {
  pawly: {
    pitch: 'Reservas más claras para quienes necesitan atención veterinaria y una agenda para quienes la coordinan.',
    contextLabel: 'Proyecto personal',
    context: 'Demo orientada a la Clínica Veterinaria Porvenir. La portada conecta a los tutores con la reserva de una consulta.',
    technical: 'Next.js conecta el portal de reservas y la agenda clínica con una API de NestJS. Prisma y PostgreSQL gestionan los datos por clínica. La API revalida la disponibilidad y controla el acceso a los documentos clínicos.',
    technologies: [
      { label: 'Frontend', technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Motion', 'Lucide React'] },
      { label: 'Backend', technologies: ['NestJS 11', 'Node.js', 'Express', 'RxJS', 'Joi'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 17', 'Prisma 6', 'Prisma Migrate'] },
      { label: 'Seguridad y autorización', technologies: ['Argon2id', 'Sesiones con cookies', 'Protección CSRF', 'Helmet', 'NestJS Throttler', 'Permisos por clínica'] },
      { label: 'Entorno local', technologies: ['Docker Compose'] },
      { label: 'Pruebas y calidad', technologies: ['Jest', 'Supertest', 'Playwright', 'Node.js Test Runner', 'ESLint', 'Prettier'] },
    ],
    technologyNote: 'Demo local con datos ficticios.',
    cover: { title: 'Página principal', caption: 'Portada de Pawly con acceso a la reserva de una consulta veterinaria.', width: 1440, height: 1000 },
  },
  zenvik: {
    pitch: 'Un espacio para que los pequeños negocios organicen a su equipo, planifiquen turnos y revisen permisos.',
    contextLabel: 'Proyecto personal',
    context: 'Producto propio en fase de MVP local. El panel reúne los turnos de hoy y las solicitudes que requieren revisión.',
    technical: 'Next.js App Router consume una API de Django REST Framework. Django usa sesiones y limita las consultas según la membresía y el rol de cada negocio.',
    technologies: [
      { label: 'Frontend', technologies: ['Next.js (App Router)', 'React', 'TypeScript', 'Tailwind CSS'] },
      { label: 'Backend', technologies: ['Python', 'Django', 'Django REST Framework', 'django-environ'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 17', 'Django ORM', 'psycopg 3'] },
      { label: 'Componentes y formularios', technologies: ['Radix UI', 'Lucide React', 'React Hook Form', 'Zod'] },
      { label: 'Autenticación', technologies: ['Sesiones de Django', 'Cookies HttpOnly', 'Protección CSRF'] },
      { label: 'Infraestructura y CI', technologies: ['Docker', 'Docker Compose', 'Gunicorn', 'GitHub Actions'] },
      { label: 'Pruebas y calidad', technologies: ['Django Test', 'Vitest', 'Playwright', 'ESLint'] },
      { label: 'Auditoría y mantenimiento', technologies: ['Ruff', 'Bandit', 'pip-audit'] },
      { label: 'Integraciones preparadas', technologies: ['Cloudflare Turnstile (opcional)', 'Flow (adaptador sandbox)'] },
    ],
    technologyNote: 'Proyecto en desarrollo local. La CI ejecuta comprobaciones sin desplegar. Turnstile y el adaptador de pagos de Flow están desactivados en el entorno documentado.',
    cover: { title: 'Resumen del espacio de trabajo', caption: 'Panel de Zenvik con turnos del día, permisos pendientes y la agenda próxima.', width: 1280, height: 1123 },
  },
  fraudshield: {
    pitch: 'Convierte transacciones CSV en resultados trazables para apoyar la revisión de operaciones según su riesgo.',
    contextLabel: 'Proyecto de título',
    context: 'Trabajo académico para la Universidad Andrés Bello centrado en la revisión de transacciones.',
    technical: 'El flujo recibe un CSV, evalúa reglas de riesgo y conserva la trazabilidad de la clasificación.',
    technologies: [
      { label: 'Frontend', technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Axios'] },
      { label: 'Backend', technologies: ['NestJS', 'Node.js', 'Express', 'TypeScript', 'csv-parse', 'Multer'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 16', 'Prisma'] },
      { label: 'Seguridad y validación', technologies: ['JWT', 'Passport', 'bcrypt', 'class-validator'] },
      { label: 'Entorno local', technologies: ['Docker Compose'] },
      { label: 'Pruebas de API', technologies: ['Postman'] },
      { label: 'Pruebas y calidad', technologies: ['Jest', 'Supertest', 'Pruebas E2E', 'ESLint', 'Prettier'] },
    ],
    technologyNote: 'Docker Compose levanta PostgreSQL 16 para el entorno local. El README documenta Postman para probar la API.',
    cover: { title: 'Flujo de análisis', caption: 'Esquema técnico del procesamiento de transacciones.', width: 343, height: 361 },
  },
  'falta-uno': {
    pitch: 'Una comunidad deportiva en desarrollo para que más personas encuentren con quién moverse.',
    contextLabel: 'Colaboración',
    context: 'Desarrollo junto a Jean Paul Gómez. La primera fase se centra en crear una cuenta e iniciar sesión.',
    technical: 'La interfaz de acceso se desarrolla en Angular, con NestJS y PostgreSQL para conectar el flujo con la capa de datos.',
    technologies: [
      { label: 'Frontend', technologies: ['Angular 22', 'TypeScript', 'Tailwind CSS 4', 'RxJS', 'Angular Signals', 'Angular Reactive Forms'] },
      { label: 'Backend', technologies: ['NestJS 12', 'Node.js 24', 'Express', 'API REST'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 18', 'Prisma 7'] },
      { label: 'Autenticación', technologies: ['Sesiones revocables', 'Cookies HttpOnly'] },
      { label: 'Entorno local', technologies: ['Docker Compose'] },
      { label: 'Pruebas y calidad', technologies: ['Vitest', 'Supertest', 'Playwright (revisión visual)', 'Oxlint', 'Prettier'] },
    ],
    cover: { title: 'Registro e inicio de sesión', caption: 'Pantalla de Falta Uno con las opciones de iniciar sesión y crear una cuenta.', width: 1440, height: 1000 },
  },
  flymaster: {
    pitch: 'Un sitio para conocer servicios con drones, explorar casos visuales y encontrar formación para pilotos.',
    contextLabel: 'Proyecto para cliente',
    context: 'Trabajo para FlyMaster UAS Solutions. El sitio público reúne su oferta de servicios y cursos.',
    technical: 'Next.js y React presentan los servicios y la flota en 3D con Three.js. El repositorio documenta dos modalidades para el contacto: una API NestJS con PostgreSQL y un adaptador PHP para Hostinger.',
    technologies: [
      { label: 'Frontend', technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Three.js', 'Lucide React', 'QRCode React'] },
      { label: 'Backend', technologies: ['NestJS 11', 'Node.js 24', 'Express', 'PHP', 'PHPMailer', 'Nodemailer'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 17', 'Prisma Next'] },
      { label: 'Seguridad y validación', technologies: ['Helmet', 'Express Rate Limit', 'class-validator'] },
      { label: 'Infraestructura y CI', technologies: ['Docker Compose', 'GitHub Actions', 'Hostinger', 'Apache'] },
      { label: 'Pruebas y calidad', technologies: ['Jest', 'Supertest', 'Playwright', 'Selenium', 'ESLint'] },
    ],
    technologyNote: 'PostgreSQL y Prisma Next pertenecen a la modalidad NestJS. La variante PHP envía los mensajes por SMTP sin usar esa base de datos.',
    cover: { title: 'Página principal', caption: 'Portada del sitio público de FlyMaster UAS Solutions.', width: 1265, height: 712 },
  },
  'portafolio-profesional': {
    pitch: 'Mi trabajo full stack, reunido en un sitio donde puedes explorar proyectos y ver sus demos.',
    contextLabel: 'Proyecto personal',
    context: 'Diseño y desarrollo del sitio, sus fichas de proyectos y los contadores de visitas y Me gusta.',
    technical: 'Next.js presenta el contenido. Una API de NestJS con PostgreSQL gestiona las visitas y los Me gusta.',
    technologies: [
      { label: 'Frontend', technologies: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'CSS Modules'] },
      { label: 'Backend', technologies: ['NestJS 12', 'Node.js 24', 'Express', 'Swagger', 'RxJS', 'Sharp'] },
      { label: 'Base de datos y ORM', technologies: ['PostgreSQL 18', 'Prisma 7', 'node-postgres', 'Migraciones SQL'] },
      { label: 'Seguridad y validación', technologies: ['Helmet', 'NestJS Throttler', 'class-validator'] },
      { label: 'Entorno local', technologies: ['Docker Compose', 'npm workspaces'] },
      { label: 'Pruebas y calidad', technologies: ['Node.js Test Runner', 'Playwright', 'Pruebas E2E', 'ESLint'] },
    ],
    cover: {
      image: '/images/projects/portafolio-portada.webp',
      title: 'Portada del portafolio',
      caption: 'Portada de YB Veltrix Solutions con acceso a los proyectos y al CV.',
      width: 1440,
      height: 1000,
    },
  },
};
