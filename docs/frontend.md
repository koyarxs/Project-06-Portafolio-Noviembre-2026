# Frontend · Next.js App Router

## Implementación

Workspace `apps/web`: Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3 y Tailwind CSS 4.3.5, con el único lockfile de la raíz. No se modificaron modelos Prisma, migraciones, seeds ni contratos de NestJS.

Rutas: `/`, `/proyectos`, `/proyectos/[slug]`, `/sobre-mi`, `/experiencia`, `/laboratorios` y `/contacto`.

`app/` contiene páginas, layout, metadata, robots, sitemap, Open Graph y estados de error/404. `components/` contiene navegación, estructura, estados vacíos/carga, proyectos, capítulos de casos, evidencias y trayectoria. `lib/` contiene contratos JSON comprobados en runtime, cliente de API exclusivo del servidor, SEO y utilidades. `test/` contiene componentes, contratos y pruebas HTTP con fixtures aisladas de PostgreSQL.

Las páginas consultan la API con Server Components, sin exponer su dirección interna o credenciales mediante NEXT_PUBLIC_. Solo la navegación interactiva y el botón de recuperación son Client Components. Filtros y paginación conservan sus parámetros en URL.

## Configuración

Copiar `apps/web/.env.example` a `apps/web/.env.local` solo si se necesitan valores distintos a los predeterminados. No copiar credenciales de PostgreSQL al frontend.

| Variable | Uso |
| --- | --- |
| PORTFOLIO_API_URL | API del servidor; por defecto http://127.0.0.1:3001/api/v1 |
| SITE_URL | URL canónica, sitemap y metadata; configurar al construir e iniciar |
| IMAGE_HOSTS | Hosts HTTPS exactos aprobados para next/image, sin comodines |
| VERIFIED_DEMO_URLS | URLs exactas verificadas editorialmente antes de mostrar una demo |
| VERIFIED_DEPLOYMENT_URLS | URLs verificadas que además deben llegar como ACTIVE desde la API |
| PORT | Puerto opcional de Next; el predeterminado es 3000 |

La API actual no contiene un campo de verificación de demos/despliegues. Las listas de URLs aprobadas evitan afirmar que cualquier enlace guardado es una demo funcional o infraestructura verificada. No se ejecutan sondas contra destinos arbitrarios. Las imágenes no aprobadas pueden abrirse como enlaces seguros; no se fabrican capturas.

## Comportamiento

- Los casos de proyectos y laboratorios se obtienen de sus endpoints públicos. La portada tiene una selección editorial independiente de repositorios públicos verificados. El frontend no lee la base ni el seed.
- Perfil ausente en la API: las secciones dinámicas muestran su estado correspondiente. La portada y el contacto conservan la identidad y los canales públicos verificados del propietario.
- API vacía y API inaccesible tienen estados diferentes. Timeout de cuatro segundos y mensajes sin detalles internos.
- Slugs privados/ausentes: 404 y noindex. El caso de proyecto no hereda un fallback global que convierta ese resultado en 200 por streaming.
- Slugs, filtros y paginación se normalizan antes de consultar NestJS. Fechas JSON se muestran en español y UTC.
- Angular no se presenta en la especialización ni en el catálogo de habilidades. La selección editorial declara Django REST como backend real de Zenvik.
- Contacto solo muestra canales públicos y CV disponibles; no hay formulario ni endpoints nuevos.
- Casos de estudio: problema, solución, arquitectura y desafíos, solo cuando existen. TechnicalEvidence admite capturas, diagramas y videos. Captions que comiencen por `Seguridad:` o `Pruebas:`/`Testing:` identifican evidencias reales de esas áreas, sin agregar campos al contrato.
- Fuentes locales, imágenes con dimensiones reservadas y next/image para hosts aprobados, HTML semántico y reduced motion. Robots impide indexar localhost; sitemap incluye exclusivamente slugs devueltos por la API pública.

## Comandos

```powershell
npm run web:dev
npm run web:test
npm run typecheck
npm run lint
npm run web:build
npm run web:test:e2e
npm run web:start
```

Para usar otro puerto: `$env:PORT='3100'` antes de iniciar Next.js. No detener otros proyectos si 3000 está ocupado. Next.js 16 separa el artefacto de desarrollo en `.next/dev`.

El build usa un solo worker para reducir el pico de memoria en este equipo. Ante recursos limitados puede ejecutarse en la terminal `$env:NODE_OPTIONS='--max-old-space-size=512 --max-semi-space-size=8'`; no se omiten los checks de TypeScript.

## Verificación realizada

- Nueve pruebas de componentes/contratos aprobadas.
- Seis pruebas HTTP sobre el build de producción aprobadas: rutas y metadata, caso de proyecto, filtros, privados/404, vacío frente a indisponibilidad y sitemap/robots. Sus datos viven en una API de prueba local y no se escriben en PostgreSQL.
- Typecheck, lint, build y auditoría ejecutados; auditoría sin vulnerabilidades reportadas.
- Diez pruebas unitarias existentes del backend aprobadas. Su última suite de integración no pudo completarse porque PostgreSQL dejó de responder y el motor Docker no estaba disponible. No se presenta ese resultado como aprobado.
- Revisión visual real de escritorio y móvil, menú móvil, navegación al catálogo y aplicación de filtros. En tablet a 768 px no se observó desbordamiento horizontal.
- Capturas guardadas fuera del repositorio en la carpeta de visualizaciones de esta conversación.

No se realizó una auditoría exhaustiva WCAG ni se midieron Core Web Vitals en usuarios reales. La optimización no se presenta como una puntuación de rendimiento inventada.

## Pendientes

Restablecer la conexión al backend/PostgreSQL para repetir la integración real. Completar el perfil y aportar textos, capturas y evidencias públicas de los proyectos. El diseño funciona con estados vacíos y de indisponibilidad sin publicar registros privados. No se realizaron commits, push ni despliegues; se conservó el staging previo y los cambios de esta etapa permanecen en el árbol de trabajo.

## Adaptación azul — 12 noviembre 2026
La dirección vigente sustituye la paleta editorial verde por azul cobalto, amarillo y blanco. Inspiración: Blue Developer Portfolio de ralphjay en Figma Community (https://www.figma.com/community/file/1693162938248147785), adaptación libre del estilo solicitada por el propietario. Implementación CSS propia; no se reutilizan la foto ni los archivos del autor.

Foto: descargada desde el visor de foto del perfil de LinkedIn indicado por el usuario; archivo local `apps/web/public/images/yerko-linkedin.jpg`. No requiere URL temporal ni autenticación para servirla. El avatar de GitHub ya no se usa.

Los cuatro proyectos de la portada son una selección editorial documentada en `apps/web/lib/owner.ts`, verificada en los README públicos de koyarxs: Pawly, Zenvik, FraudShield y Falta Uno. Las imágenes proceden de sus propios repositorios. FraudShield usa una ilustración de portada, no una captura. Pawly, Zenvik y Falta Uno muestran capturas de desarrollo. Falta Uno acredita la colaboración con Jean Paul Gómez y conserva su stack Angular real; Angular no se añade al stack principal del perfil. Zenvik declara Django REST. FlyMaster enlaza únicamente a https://flymaster.cl, divulgado por el README público del perfil; no se publica su repositorio privado.

La portada y los canales de contacto no necesitan conexión con la API. Las rutas de casos, filtros, sitemap y permisos de publicación siguen dependiendo de la API: esta selección externa no convierte registros privados en casos públicos.
