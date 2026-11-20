# Yerko Barrera · YB Veltrix Solutions

Portafolio profesional de **Yerko Andrés Barrera Pantoja**, Ingeniero en Computación e Informática y Licenciado en Ingeniería por la Universidad Andrés Bello. Experiencia, proyectos y tecnologías de desarrollo Full Stack, reunidos en una aplicación con **Next.js, NestJS y PostgreSQL**.

[GitHub](https://github.com/koyarxs) · [LinkedIn](https://www.linkedin.com/in/yerko-andr%C3%A9s-barrera-pantoja-a82821123/) · [Documentación del frontend](docs/frontend.md)

![Portada y navegación de YB Veltrix Solutions](docs/images/actual-inicio.jpg)

## Estado actual

Actualizado el **20 de noviembre de 2026**. Desarrollo local; este repositorio no acredita un despliegue de producción. El frontend editorial puede consultarse sin backend; las funciones de comunidad, visitas y administración requieren la API, PostgreSQL y su configuración.

## Secciones del portafolio

- **Inicio y navegación** con portada animada, avatar, carrusel de tecnologías, accesos de visitante y un pie de página con contacto y navegación.
- **Proyectos** con filtros en la portada y fichas individuales. Las fichas reúnen descripción, capturas, tecnologías y videos cuando están disponibles.
- **Perfil, trayectoria y servicios** con la experiencia profesional, títulos, cursos, certificaciones y áreas de trabajo de YB Veltrix Solutions.
- **Preguntas frecuentes y Asistente Veltrix** con respuestas sobre proyectos, servicios, tecnologías y contacto. El chat puede usar el modelo local del navegador para reconocer consultas cuando está disponible y admite un enlace opcional de atención humana mediante `TAWK_DIRECT_CHAT_URL`.
- **Visitas y Me gusta** con contadores persistentes en la barra lateral. La API de comunidad conserva comentarios, respuestas, reacciones, adjuntos, reportes y moderación.

## Capturas de la versión actual

| Sección | Vista |
| --- | --- |
| Carrusel de tecnologías | ![Carrusel de tecnologías](docs/images/actual-carrusel.jpg) |
| Stack tecnológico | ![Stack tecnológico](docs/images/actual-stack.jpg) |
| Galería de proyectos | ![Galería de proyectos destacados](docs/images/actual-proyectos.jpg) |
| Sobre mí | ![Página Sobre mí](docs/images/actual-sobre-mi.jpg) |
| Trayectoria | ![Página Trayectoria](docs/images/actual-trayectoria.jpg) |
| Servicios | ![Página de servicios](docs/images/actual-servicios.jpg) |
| Preguntas frecuentes | ![Preguntas frecuentes](docs/images/actual-preguntas.jpg) |
| Asistente Veltrix | ![Asistente Veltrix abierto](docs/images/actual-asistente.jpg) |
| Pie de página | ![Pie de página de Veltrix](docs/images/actual-footer.jpg) |

[Ver portada móvil](docs/images/actual-movil.jpg)

## Proyectos destacados

| Proyecto | Qué muestra | Tecnologías principales | Enlaces y captura |
| --- | --- | --- | --- |
| **Pawly** | Sitio y sistema veterinario; demo en desarrollo | Next.js · NestJS · PostgreSQL | [Repositorio](https://github.com/koyarxs/Project-03-Pawly-Octubre-2026) · [Captura](docs/images/actual-pawly.jpg) |
| **Zenvik** | Gestión de equipos, turnos y permisos; MVP local | React · Next.js · TypeScript · Python · Django REST · PostgreSQL | [Repositorio](https://github.com/koyarxs/Project-05-Zenvik-Octubre-2026) · [Captura](docs/images/actual-zenvik.jpg) |
| **FraudShield** | Análisis de transacciones CSV y clasificación de riesgo; proyecto de título | Next.js · NestJS · Prisma | [Repositorio](https://github.com/koyarxs/Project-01-FraudShield-Septiembre-2026) · [Captura](docs/images/actual-fraudshield.jpg) |
| **Falta Uno** | Plataforma deportiva colaborativa con Jean Paul Gómez; en desarrollo | Angular · NestJS · PostgreSQL | [Repositorio](https://github.com/koyarxs/Project-04-Sistema-Deporte-Octubre-2026) · [Captura](docs/images/actual-falta-uno.jpg) |
| **FlyMaster** | Sitio de servicios con drones y formación para pilotos | Next.js · React · NestJS · PostgreSQL | [Sitio](https://flymaster.cl) · [Repositorio privado](https://github.com/koyarxs/Project-02-FlyMaster-Octubre-2026) · [Captura](docs/images/actual-flymaster.jpg) |
| **Portafolio profesional** | Sitio de YB Veltrix Solutions, con comunidad y panel de moderación | Next.js · NestJS · PostgreSQL | [Captura](docs/images/actual-portafolio.jpg) |

El enlace al repositorio privado de FlyMaster requiere autorización; no se publica su código en este portafolio. Los destacados editoriales se publican en `/proyectos/destacados/[slug]`. Sus datos y fichas se mantienen en `apps/web/lib/owner.ts`, `apps/web/lib/featured-project-stories.ts` y `apps/web/components/public-work.tsx`. El catálogo conectado a la API se consulta en `/proyectos`.

## Arquitectura y stack del repositorio

| Capa | Tecnologías |
| --- | --- |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · CSS Modules |
| Backend | Node.js 24 · NestJS 12 · Express · validación de DTOs · Helmet · límites de solicitudes |
| Persistencia | PostgreSQL 18 · Prisma ORM 7 · adaptador PostgreSQL · migraciones SQL |
| Comunidad | BFF de Next.js · identidad anónima firmada · cookies HttpOnly · procesamiento de imágenes con sharp |
| Pruebas y herramientas | Node Test Runner · Playwright · npm workspaces · ESLint · Docker Compose |

Las dependencias exactas están fijadas en `package-lock.json`. El stack profesional mostrado en la web es más amplio que las dependencias de este repositorio: incluye Angular, Python y Django REST por Falta Uno y Zenvik, además de otras herramientas del perfil.

```text
apps/
  web/                       # App Router, diseño, BFF, panel y pruebas web
  api/                       # API REST, visitantes, comunidad y moderación
packages/
  database/src/              # Cliente Prisma compartido
  community/src/             # Contratos e identidad compartidos
prisma/
  schema.prisma              # Modelo de contenido, visitas e interacciones
  migrations/                # Historial SQL, incluidas ampliaciones de comunidad
  seed.ts                    # Catálogo inicial idempotente
scripts/                     # Configuración y verificaciones locales
docs/                        # Arquitectura, operación, fuentes y capturas
compose.yml                  # PostgreSQL local con volumen persistente
```

## Inicio rápido: frontend

Requisitos: **Node.js 24**, npm y PowerShell o una terminal compatible.

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run db:generate
npm run web:dev
```

Abrir [http://127.0.0.1:3000](http://127.0.0.1:3000). Para configurar la web, copiar `apps/web/.env.example` a `apps/web/.env.local`, conservando cualquier archivo existente. Las funciones conectadas muestran estados de conexión cuando la API no está disponible.

## Base de datos y API

Requisitos adicionales: Docker Desktop con motor Linux y el puerto PostgreSQL local configurado, por defecto `55432`.

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Elegir credenciales locales y actualizar DATABASE_URL en .env.
npm run db:up
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:verify
npm run api:dev
```

La API responde en [http://127.0.0.1:3001/api/v1](http://127.0.0.1:3001/api/v1); Swagger está en `/api/v1/docs` durante desarrollo. Los listados de contenido usan `{ data, meta }` y los detalles `{ data }`.

| Área | Rutas principales |
| --- | --- |
| Contenido | `/profile`, `/projects`, `/technologies`, `/experience`, `/education`, `/certifications`, `/security-labs` |
| Salud | `/health`, `/health/ready` |
| Interacción | `/visitors`, `/community`, comentarios, respuestas, reacciones, reportes y medios |
| Propietario | `/community-admin`, mediante credencial servidor a servidor |

Los proyectos privados de la API responden 404 en las rutas públicas. El seed conserva registros existentes y no publica automáticamente los proyectos de la base de datos.

## Comunidad y panel del propietario

```powershell
npm run community:configure
```

El asistente local prepara las variables necesarias; consultar [la guía de comunidad](docs/portfolio-community.md) antes de habilitarla. El panel está en `/admin/community`. No hay una cuenta administrativa predeterminada y el acceso permanece deshabilitado si falta su configuración.

- El navegador pasa por las rutas BFF `/api/visitors`, `/api/community` y `/api/community-admin`.
- Las claves del propietario y los secretos de firma permanecen en el servidor.
- Las imágenes se validan, procesan y sirven con comprobaciones de acceso.
- La moderación incluye aprobación, ocultación, eliminación recuperable, fijado, respuestas del propietario, reportes y bloqueo de participantes.
- La portada muestra visitas y Me gusta. Los contadores representan navegadores.

No versionar `.env`, archivos de datos, medios locales de usuarios ni credenciales. El esquema y las migraciones sí se incluyen. No eliminar volúmenes para solucionar incidencias de conexión.

## Comprobaciones

```powershell
npm run typecheck
npm run web:test
npm run test:unit
npm run api:build
npm run web:build
npm run web:test:e2e
```

Las pruebas HTTP de la web usan servicios de prueba en `3101` y `4011`; las pruebas de integración del backend requieren PostgreSQL. Para aislar las pruebas de comunidad de la base de trabajo:

```powershell
npm run community:test:isolated
```

Las capturas de esta versión se tomaron en Chrome con el portafolio ejecutándose de forma local, a 1440 px en escritorio y 390 px en móvil.

## Documentación y recursos

- [Frontend y fuentes de contenido](docs/frontend.md)
- [Navbar y horario de atención](docs/navbar-design.md)
- [Stack y banner](docs/technology-stack.md) · [Logos y licencias](docs/stack-assets.md)
- [Trayectoria y medios profesionales](docs/career-media.md)
- [Comunidad, seguridad y moderación](docs/portfolio-community.md)
- [Operación y diagnóstico](docs/operations.md)
- [Modelo de datos](docs/database.md)
- [Backend](docs/backend.md) · [Contrato de API](docs/public-api.md)

Los logos de tecnologías conservan sus marcas y atribuciones; los recursos de Devicon incluyen su licencia. La fotografía del banner del stack acredita a Maurits Bausenhart en Unsplash. Los recursos de marca de YB Veltrix Solutions y los datos profesionales fueron proporcionados por el propietario.

---

**Yerko Barrera · YB Veltrix Solutions**
Ingeniería de Software y Desarrollo Full Stack · Valparaíso, Chile.
