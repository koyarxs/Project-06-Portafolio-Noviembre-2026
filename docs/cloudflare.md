# Portafolio en Cloudflare Workers

El workspace `apps/web` se empaqueta con OpenNext 1.20.17 y Wrangler 4.165.0. El rango de OpenNext incluye Next.js 16.4.6 y Wrangler 4.165.0. El adaptador conserva App Router, componentes de servidor, rutas API, metadatos y páginas prerenderizadas. Node.js 24 ejecuta la compilación. En producción, el frontend usa el runtime de Workers con `nodejs_compat`. [Compatibilidad oficial de OpenNext](https://opennext.js.org/cloudflare)

## Infraestructura

| Componente | Destino | Requisitos |
| --- | --- | --- |
| Inicio, servicios, trayectoria, fichas destacadas, imágenes y fuentes | Worker y Workers Static Assets | El caché de páginas prerenderizadas forma parte del build. Las imágenes del Worker se sirven como archivos originales. |
| Catálogo conectado, laboratorios, sitemap y proxies de interacción | Worker | URL HTTPS de la API. Los proxies de la comunidad requieren firma compartida. |
| NestJS, Prisma, PostgreSQL y procesamiento de archivos con sharp | Servicio Node.js independiente y PostgreSQL | Node.js 24, API accesible por HTTPS, base persistente con TLS y volumen persistente para adjuntos si se habilitan. Docker Compose ofrece PostgreSQL solo en localhost para desarrollo. |

Workers Free tiene 100.000 solicitudes diarias y 10 ms de CPU por solicitud. Esta configuración usa el almacenamiento de recursos estáticos de Workers; prescinde de R2 y Cloudflare Images. Mide el arranque y la CPU de las rutas SSR en el primer despliegue autorizado. El plan de Workers cubre el frontend. Para la API y PostgreSQL revisa las cuotas, el costo de un servicio Node siempre activo, el almacenamiento y los respaldos. El disco persistente de adjuntos y la salida de datos pueden tener costo. Un servicio que entra en reposo puede superar los tiempos de espera del proxy. [Límites de Workers](https://developers.cloudflare.com/workers/platform/limits/)

## Compilación y pruebas locales

Desde la raíz del repositorio, con Node.js 24:

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run db:generate
npm run typecheck
npm run lint
npm run web:test
npm run test:unit
npm run api:build
npm run cf:build --workspace @portfolio/web
npm run cf:check --workspace @portfolio/web
npm run cf:preview --workspace @portfolio/web
```

`cf:check` prepara la caché estática local y usa el modo `--dry-run` de Wrangler. La vista previa sirve el Worker local y se abre en la dirección que muestra Wrangler. Usa `apps/web/.dev.vars` para valores de ejecución de prueba del Worker y `apps/web/.env.local` para `next dev`. `cf:build` vacía el módulo que OpenNext genera con datos de los archivos dotenv del monorepo y del workspace. `cf:check` y `cf:deploy` comprueban ese módulo antes de continuar. Usa los scripts del workspace al preparar el artefacto. Las pruebas HTTP existentes arrancan `next start` con una API de fixtures y se ejecutan con `npm run web:test:e2e` después de compilar. Para integración real contra una base aislada en Windows con PostgreSQL 18 instalado, ejecuta `npm run community:test:isolated` y luego `node scripts/community-test-db.mjs --stop`. [Variables locales y de producción en OpenNext](https://opennext.js.org/cloudflare/howtos/env-vars)

## Workers Builds con GitHub

Tras autorizar el primer despliegue y publicar estos cambios en GitHub, ve a **Workers & Pages → Create application → GitHub**. Autoriza la integración para `koyarxs/Project-06-Portafolio-Noviembre-2026` y selecciona el repositorio. Para un Worker existente con el mismo nombre, usa **Settings → Builds → Connect**.

| Campo | Valor |
| --- | --- |
| Tipo de proyecto | **Worker** |
| Nombre | `portafolio-veltrix` |
| Rama de producción | `main` |
| Root directory | `apps/web` |
| Build command | `npm ci --prefix ../.. --include=dev && npm run cf:build` |
| Deploy command | `npm run cf:deploy` |
| Preview builds | Desactivadas inicialmente. Si se habilitan, usa un backend y secretos separados de producción. |
| Build variables | `NODE_VERSION=24.22.0`, `SKIP_DEPENDENCY_INSTALL=1` y `SITE_URL` con la URL HTTPS asignada al Worker o el dominio final |
| API token del build | Token administrado por Workers Builds |

El nombre del panel debe coincidir con `apps/web/wrangler.jsonc`. El comando instala desde el lockfile raíz y ejecuta OpenNext desde el workspace web. **Save and Deploy** inicia el primer despliegue. Los siguientes cambios enviados a `main` activan Workers Builds. Si eliges el flujo manual, configura las variables y autentica la cuenta localmente con `npm exec --workspace @portfolio/web -- wrangler login` antes de ejecutar el despliegue autorizado. [Monorepos en Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/) · [Conexión con GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/) · [Variables de compilación](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)

```powershell
# Con SITE_URL configurada en el entorno de la terminal
npm run cf:build --workspace @portfolio/web
npm run cf:check --workspace @portfolio/web
npm run cf:deploy --workspace @portfolio/web
```

## Variables y secretos de producción

Configura los valores de ejecución en **Settings → Variables and Secrets** del Worker. `keep_vars` conserva las variables del panel durante el despliegue.

| Nombre | Dónde y valor |
| --- | --- |
| `SITE_URL` | Variable de build y ejecución del Worker. URL HTTPS canónica del frontend, necesaria para metadatos, robots y sitemap. |
| `PORTFOLIO_API_URL` | Variable de ejecución del Worker. Base HTTPS pública de NestJS, con sufijo `/api/v1`. |
| `TAWK_DIRECT_CHAT_URL` | Opcional. Variable de build y ejecución si se habilita el enlace de atención humana. |
| `IMAGE_HOSTS`, `VERIFIED_DEMO_URLS`, `VERIFIED_DEPLOYMENT_URLS` | Opcionales. Hosts de medios en el build y listas de URLs aprobadas en ejecución. |
| `COMMUNITY_SIGNING_SECRET` | Secreto de ejecución del Worker y de NestJS. Genera al menos 48 caracteres aleatorios y usa el mismo valor en ambos servicios. |
| `COMMUNITY_ADMIN_TOKEN` | Secreto de ejecución opcional del Worker y de NestJS. Usa el mismo valor aleatorio, distinto de la clave de firma, con al menos 48 caracteres. Sin valor, la administración permanece deshabilitada. |
| `DATABASE_URL` | Secreto exclusivo de NestJS y del proceso de migración. Usa la configuración TLS del proveedor y un usuario de base de datos con los permisos requeridos. |
| `NODE_ENV`, `API_HOST`, `API_PORT`, `CORS_ORIGINS`, `COMMUNITY_UPLOAD_DIR` | Configuración de NestJS. Usa `production`, la interfaz y puerto asignados por el proveedor, el origen HTTPS exacto del frontend y, si se usan adjuntos, una ruta absoluta sobre almacenamiento persistente. |

El servicio Node puede instalarse con `npm ci --include=dev`, generar Prisma con `npm run db:generate`, compilar con `npm run api:build` e iniciar con `npm run api:start`, desde la raíz. Aplica `npm run db:deploy` como un paso separado y autorizado sobre la base de destino tras verificar respaldos y conexión. Las migraciones no se ejecutan durante el build del Worker. Conserva los secretos en los paneles de cada servicio, fuera de Git y de variables `NEXT_PUBLIC_*`.

## Preparar el servicio de API

Para un alojamiento que reciba contenedores, usa la raíz como contexto y `apps/api/Dockerfile` como Dockerfile. El objetivo predeterminado instala con `npm ci --omit=dev` y ejecuta la API como usuario `node`. La imagen separada `migrations` contiene la CLI de Prisma. Ambas se construyen sin acceso a la base de destino. La imagen de API arranca en `0.0.0.0` y usa `API_PORT`, luego `PORT` del proveedor o `3001`. El estado de disponibilidad consulta PostgreSQL por `/api/v1/health/ready`.

```powershell
docker build -f apps/api/Dockerfile -t portfolio-api:production .
docker build -f apps/api/Dockerfile --target migrations -t portfolio-api:migrations .
```

Configura `DATABASE_URL` en el gestor de secretos del proveedor para la API y sus migraciones. La tarea de migración admite eventualmente una conexión directa separada que tenga permiso de DDL. Programa la tarea de migración como paso único antes de arrancar el servicio de una primera instalación. El runtime recibe también `CORS_ORIGINS` con el origen HTTPS del Worker y `COMMUNITY_SIGNING_SECRET` con la misma clave que el Worker. Si se habilitan adjuntos, monta almacenamiento persistente con permisos de escritura para el usuario del contenedor en `/var/lib/portfolio/uploads`. Publica la API detrás de HTTPS. [Prisma Migrate en producción](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production)

`cf:deploy` exige que `SITE_URL` sea un origen HTTPS y que coincida con el sitemap declarado por los metadatos del build. Así se bloquea la publicación accidental de un artefacto compilado con localhost o con un dominio anterior. Define la URL canónica en Workers Builds y en las variables de ejecución. Verifica primero la disponibilidad de NestJS y PostgreSQL, luego configura el Worker con la URL HTTPS de la API y la firma compartida.

## Diagnóstico y seguridad

- `POST /api/visitors` y `GET /api/community` firman la identidad del navegador y consultan NestJS. Devuelven 503 ante firma ausente en producción, errores de transporte, respuestas upstream incompatibles o indisponibilidad de PostgreSQL. En la configuración local inicial, no había servicios escuchando en los puertos 3001 y 55432. Comprueba primero `/api/v1/health` y `/api/v1/health/ready` de la API. Si ambos funcionan, revisa la URL del Worker y confirma que las claves coincidan sin imprimirlas.
- NestJS aplica validación DTO, límites de cuerpo y de solicitudes, Helmet y CORS con orígenes explícitos. Las operaciones inspeccionadas de SQL usan Prisma y consultas etiquetadas parametrizadas. El BFF limita el tamaño del cuerpo, comprueba el origen para escrituras y firma cookies HttpOnly, Secure en HTTPS y SameSite. CORS permite el tráfico servidor a servidor sin cabecera `Origin`.
- El límite de intentos de administración es por proceso o instancia. Si habilitas el panel, protege `/admin/community` y `/api/community-admin` con una política de acceso en todos los hostnames que lo exponen. Verifica los límites de Nest detrás del proxy del proveedor y comprueba que el tráfico del Worker no consuma una sola cuota compartida por todos los visitantes.
- Antes de activar la integración, verifica el dominio canónico, la salud de PostgreSQL, las respuestas reales de visitas y comunidad, el almacenamiento de adjuntos si se usa y el acceso al panel si se habilita.

## Validación local

- Typecheck, ESLint, compilación de NestJS, 27 pruebas unitarias, 10 pruebas HTTP de Playwright y 32 pruebas de integración con PostgreSQL aislado aprobados.
- La compilación estándar y la de OpenNext usan Webpack. Turbopack falló en Windows al procesar el CSS de Newsreader; `next dev` sigue usando su configuración habitual.
- OpenNext y Wrangler ejecutaron el Worker local. Se verificaron 16 rutas, un 404, estados 503 sin conexión y respuestas 200 de visitas y comunidad con NestJS y PostgreSQL de prueba. Chrome cargó imágenes y fuentes en escritorio y móvil y reprodujo el video de FlyMaster. El servidor local devolvió el archivo completo para una solicitud de rango. Queda por verificar el comportamiento de rangos en Cloudflare.
- La instalación desde el lockfile, el build de OpenNext y la validación seca pasaron también desde una copia limpia sin archivos dotenv locales. Wrangler reportó aproximadamente 7,8 MiB sin comprimir y 234 archivos estáticos.
- Se probaron las imágenes Docker de migración y producción con PostgreSQL 18 aislado. Se aplicaron las cuatro migraciones y se verificaron disponibilidad, catálogo, CORS, el puerto del proveedor y que la API puede escribir adjuntos como usuario sin privilegios.
- La auditoría de npm con `--omit=dev` no reportó vulnerabilidades. Se fijó Effect 3.22.1 dentro de la rama mayor que usa Prisma 7. La auditoría completa conserva avisos moderados en la cadena de `glob` y `minimatch` de OpenNext, usada durante la compilación. La corrección automática propuesta por npm cambia OpenNext a una versión incompatible con la integración.
- El artefacto validado no contiene los valores locales de conexión PostgreSQL, firma ni administración comprobados. Quedan pendientes la publicación autorizada, la configuración de los servicios de producción y la validación de los límites de CPU con tráfico real.

## Archivos de esta preparación

| Área | Archivos |
| --- | --- |
| Compilación y despliegue | `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/open-next.config.ts`, `apps/web/wrangler.jsonc`, `apps/web/scripts/build-worker-next.mjs`, `apps/web/scripts/worker-env.mjs` |
| Dependencias y exclusiones | `package.json`, `package-lock.json`, `.gitignore`, `eslint.config.mjs` |
| Imágenes y cabeceras | `apps/web/components/public-work.tsx`, `apps/web/components/public-work.module.css`, `apps/web/public/_headers` |
| Documentación | `README.md`, `docs/cloudflare.md`, `apps/web/.env.example` |
| API para producción | `.dockerignore`, `apps/api/Dockerfile`, `apps/api/src/config/environment.ts`, `apps/api/test/unit.test.ts` |
