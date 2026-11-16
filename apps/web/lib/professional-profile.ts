// Profile and stack supplied directly by the owner, 2026-11-16.
export const professionalBiography = [
  'Ingeniero en Computación e Informática y Licenciado en Ingeniería por la Universidad Andrés Bello, con más de 4 años de experiencia profesional en TI, actualmente enfocado en Ingeniería de Software y Desarrollo Full Stack.',
  'Fundador de YB Veltrix Solutions, iniciativa tecnológica dedicada al desarrollo de aplicaciones web, soluciones empresariales y plataformas SaaS, con enfoque en innovación, seguridad y escalabilidad.',
  'Cuento con experiencia en soporte tecnológico, administración de sistemas y desarrollo de soluciones de software, integrando frontend, backend, bases de datos, testing y prácticas DevOps.',
  'Actualmente desarrollo proyectos Full Stack y continúo fortaleciendo mis conocimientos en arquitectura de software, Cloud, DevOps, ciberseguridad e inteligencia artificial.',
  'Mi objetivo es seguir creciendo como Software Engineer y Full Stack Developer, participando en proyectos de alto impacto e impulsando soluciones tecnológicas innovadoras a través de YB Veltrix Solutions.',
] as const;

export const technologyGroups = [
  { number: '01', title: 'Frontend', detail: 'Desarrollo interfaces web con React, Next.js y Angular, combinando componentes reutilizables, tipado con TypeScript y estilos con Tailwind CSS. Me enfoco en una navegación clara, diseños adaptables y experiencias que funcionen bien en distintos dispositivos.', names: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript', 'Tailwind CSS'] },
  { number: '02', title: 'Backend', detail: 'Construyo la lógica que conecta la interfaz con los datos mediante Node.js, NestJS, Express y Python con Django REST. Organizo servicios y APIs REST para gestionar procesos, validar información e integrar las distintas partes de una aplicación.', names: ['Node.js', 'NestJS', 'Express', 'Python', 'Django REST', 'APIs REST'] },
  { number: '03', title: 'Bases de datos', detail: 'Trabajo con PostgreSQL y MongoDB para organizar la información según las necesidades de cada proyecto. Utilizo Prisma ORM para conectar la aplicación con sus datos, definir modelos y mantener una estructura coherente a medida que el sistema evoluciona.', names: ['PostgreSQL', 'MongoDB', 'Prisma ORM'] },
  { number: '04', title: 'Testing', detail: 'Pruebas unitarias, de integración y de extremo a extremo (E2E).', names: ['Jest', 'Vitest', 'Playwright', 'E2E'] },
  { number: '05', title: 'DevOps', detail: 'Utilizo Git y GitHub para versionar y colaborar, y Docker para preparar entornos consistentes. Con GitHub Actions y CI/CD conecto verificaciones, pruebas y entregas.', names: ['Docker', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD'] },
  { number: '06', title: 'Seguridad', detail: 'Incorporo autenticación con JWT y control de acceso por roles con RBAC para definir quién puede acceder a cada función. Tomo como referencia las buenas prácticas de OWASP para reforzar la validación de entradas y la protección de la información.', names: ['JWT', 'RBAC', 'OWASP'] },
] as const;

// Google Cloud Platform is included at the owner's explicit request.
export const cloudPlatforms = [
  { logo: 'amazonwebservices', name: 'Amazon Web Services', short: 'AWS', plannedUse: 'Para alojar APIs, almacenar archivos y explorar infraestructura escalable.' },
  { logo: 'azure', name: 'Microsoft Azure', short: 'AZURE', plannedUse: 'Para desplegar aplicaciones empresariales e integrar identidad y acceso.' },
  { logo: 'googlecloud', name: 'Google Cloud Platform', short: 'GCP', plannedUse: 'Para ejecutar aplicaciones en contenedores y explorar servicios de datos e IA.' },
] as const;

export const technologySummaries: Record<string, string> = {
  'Visual Studio Code': 'Editor de código y depuración.',
  Angular: 'Interfaces web · Falta Uno.',
  Python: 'Lógica de negocio · Zenvik.',
  'Django REST': 'APIs REST con Python · Zenvik.',
  React: 'Interfaces y componentes · Zenvik.', 'Next.js': 'Aplicaciones web · Zenvik.',
  TypeScript: 'Código con tipos seguros.', JavaScript: 'Lógica e interactividad.',
  'Tailwind CSS': 'Diseño adaptable.', 'Node.js': 'Servicios en el servidor.',
  NestJS: 'Backend modular · Falta Uno.', Express: 'Rutas y middleware.', 'APIs REST': 'Comunicación entre servicios.',
  PostgreSQL: 'Datos relacionales.', MongoDB: 'Datos en documentos.', 'Prisma ORM': 'Modelos y consultas tipadas.',
  Jest: 'Pruebas de lógica y servicios.', Vitest: 'Pruebas rápidas de componentes.', Playwright: 'Pruebas en navegador.', E2E: 'Flujos completos de usuario.',
  Docker: 'Entornos en contenedores.', Git: 'Control de versiones.', GitHub: 'Repositorios y colaboración.',
  'GitHub Actions': 'Automatización de verificaciones.', 'CI/CD': 'Integración y entrega continua.',
  JWT: 'Autenticación con tokens.', RBAC: 'Permisos por roles.', OWASP: 'Buenas prácticas de seguridad.',
};

export const technologyDetails: Record<string, { logo: string; text: string }> = {
  Angular: { logo: 'angular', text: 'Desarrollo de la interfaz de Falta Uno con Angular.' },
  Python: { logo: 'python', text: 'Desarrollo del backend de Zenvik con Python.' },
  'Django REST': { logo: 'django', text: 'APIs del backend de Zenvik con Django REST.' },
  'Visual Studio Code': { logo: 'vscode', text: 'Editor para escribir, organizar y depurar el código de mis proyectos.' },
  E2E: { logo: 'playwright', text: 'Pruebas de extremo a extremo para verificar flujos completos de usuario con Playwright.' },
  GitHub: { logo: 'github', text: 'Lo utilizo para alojar repositorios, organizar tareas y revisar cambios mediante pull requests. Centraliza la colaboración y conecta el código con los flujos automatizados de verificación.' },
  React: { logo: 'react', text: 'Lo utilizo para construir interfaces con componentes reutilizables, organizar la interacción del usuario y mantener una experiencia consistente entre las distintas pantallas.' },
  'Next.js': { logo: 'nextjs', text: 'Lo utilizo para estructurar aplicaciones React con rutas, páginas y renderizado. Me permite conectar la interfaz con los datos y preparar una navegación clara dentro del producto.' },
  TypeScript: { logo: 'typescript', text: 'Lo utilizo para definir tipos y contratos entre componentes, servicios y datos. Ayuda a detectar incompatibilidades durante el desarrollo y facilita mantener el código cuando el proyecto crece.' },
  JavaScript: { logo: 'javascript', text: 'Lo utilizo para implementar la lógica de interacción, manejar eventos y trabajar con operaciones asíncronas, como las solicitudes que conectan el navegador con una API.' },
  'Tailwind CSS': { logo: 'tailwindcss', text: 'Lo utilizo para componer estilos y adaptar las interfaces a distintos tamaños de pantalla, manteniendo coherencia en espacios, colores, tipografía y estados de los elementos.' },
  'Node.js': { logo: 'nodejs', text: 'Lo utilizo para ejecutar JavaScript y TypeScript en el servidor, desarrollar servicios y procesar solicitudes que conectan la aplicación con sus datos e integraciones.' },
  NestJS: { logo: 'nestjs', text: 'Lo utilizo para organizar el backend en módulos, controladores y servicios. Esta estructura permite separar responsabilidades, validar entradas y mantener la lógica de negocio ordenada.' },
  Express: { logo: 'express', text: 'Lo utilizo para definir rutas HTTP y middleware en servicios Node.js, gestionar solicitudes y respuestas e implementar integraciones que necesitan una estructura flexible.' },
  'APIs REST': { logo: 'rest-api', text: 'Las utilizo para comunicar frontend y backend mediante recursos, métodos HTTP y respuestas estructuradas. Defino validaciones y manejo de errores para que cada operación tenga un comportamiento claro.' },
  PostgreSQL: { logo: 'postgresql', text: 'Lo utilizo para modelar información relacional, definir vínculos entre entidades y consultar datos con SQL. Me permite trabajar con restricciones y transacciones para cuidar la consistencia de la información.' },
  MongoDB: { logo: 'mongodb', text: 'Lo utilizo para trabajar con información organizada en documentos, cuando el modelo necesita estructuras flexibles. Diseño las colecciones y consultas de acuerdo con las necesidades de acceso a los datos.' },
  'Prisma ORM': { logo: 'prisma', text: 'Lo utilizo para definir modelos, gestionar migraciones y consultar la base de datos desde TypeScript. Facilita mantener alineadas la estructura de persistencia y las operaciones de la aplicación.' },
  Jest: { logo: 'jest', text: 'Lo utilizo para pruebas unitarias y de integración de la lógica del backend. Con mocks y aserciones reviso servicios, validaciones, respuestas esperadas y casos de error de forma aislada o combinada.' },
  Vitest: { logo: 'vitest', text: 'Lo utilizo para comprobar funciones, utilidades y comportamiento de componentes durante el desarrollo. Permite ejecutar pruebas rápidas y detectar regresiones al modificar la interfaz o la lógica compartida.' },
  Playwright: { logo: 'playwright', text: 'Lo utilizo para pruebas de extremo a extremo en un navegador, recorriendo páginas, formularios y flujos de usuario. Compruebo que las partes de la aplicación funcionen juntas y que las acciones produzcan el resultado esperado.' },
  Docker: { logo: 'docker', text: 'Lo utilizo para preparar contenedores con los servicios y dependencias del proyecto. Ayuda a reproducir entornos de desarrollo y a reducir diferencias de configuración entre equipos.' },
  Git: { logo: 'git', text: 'Lo utilizo para versionar el código, trabajar con ramas y revisar la evolución de cada cambio. Mantiene la trazabilidad del desarrollo y facilita la colaboración y la recuperación de versiones anteriores.' },
  'GitHub Actions': { logo: 'githubactions', text: 'Lo utilizo para automatizar tareas del repositorio, como ejecutar verificaciones, pruebas y compilaciones. Estos flujos ayudan a revisar los cambios antes de integrarlos o preparar una entrega.' },
  'CI/CD': { logo: 'pipeline', text: 'Aplico integración continua y preparación automatizada de entregas para conectar cambios, validaciones y compilación. El despliegue se configura según las necesidades y el entorno de cada proyecto.' },
  JWT: { logo: 'jwt', text: 'Lo utilizo para gestionar autenticación mediante tokens y validar solicitudes a recursos protegidos. Considero la verificación de firmas, la expiración y el tratamiento de errores dentro del flujo de acceso.' },
  RBAC: { logo: 'access-control', text: 'Lo utilizo para organizar permisos por roles y limitar las acciones disponibles para cada tipo de usuario. La autorización se comprueba en el servidor para proteger operaciones y datos.' },
  OWASP: { logo: 'security', text: 'Tomo sus recomendaciones como referencia para revisar riesgos de seguridad web, validar entradas y proteger accesos. Integro estas prácticas durante el desarrollo y la revisión del software.' },
  'Amazon Web Services': { logo: 'amazonwebservices', text: 'Forma parte de mi enfoque Cloud para estudiar cómo alojar aplicaciones, conectar servicios y gestionar infraestructura. Continúo fortaleciendo mis conocimientos en despliegue, permisos y operación segura.' },
  'Microsoft Azure': { logo: 'azure', text: 'Lo incorporo a mi formación en plataformas Cloud para comprender la publicación de aplicaciones y su integración con servicios empresariales, prestando atención a configuración, identidad y seguridad.' },
  'Google Cloud Platform': { logo: 'googlecloud', text: 'Lo integro a mi aprendizaje en Cloud para explorar alternativas de ejecución, servicios de datos e infraestructura. Mi foco está en comprender cómo adaptar el entorno a las necesidades de una aplicación.' },
};
