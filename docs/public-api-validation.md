# Informe técnico · API REST pública

Validación realizada el 12 de noviembre de 2026, según el contexto America/Santiago del usuario.

## Implementación

Se añadieron ProfileModule, ProjectsModule, TechnologiesModule, ExperienceModule, EducationModule, CertificationsModule y SecurityLabsModule, cada uno con controlador y servicio. ProjectsModule incorpora ProjectResourcesService para componer las consultas de medios y despliegues relacionados.

Rutas GET implementadas bajo `/api/v1`: `/profile`, `/projects`, `/projects/:slug`, `/technologies`, `/technologies/:slug`, `/experience`, `/education`, `/certifications`, `/security-labs` y `/security-labs/:slug`. Se mantienen `/health` y `/health/ready`.

Las consultas de contenido son de solo lectura, con DTO de entrada y respuesta, paginación uniforme y selects explícitos. Los listados comparten conteo y datos en una transacción RepeatableRead. El contrato completo, las políticas de publicación y ejemplos están en `public-api.md`.

## Cambios en archivos

Archivos nuevos:

```text
apps/api/src/common/api-response.decorator.ts
apps/api/src/common/paginate.ts
apps/api/src/common/public-response.dto.ts
apps/api/src/common/public-selects.ts
apps/api/src/common/query.dto.ts
apps/api/src/openapi.ts
apps/api/src/profile/profile.controller.ts
apps/api/src/profile/profile.service.ts
apps/api/src/profile/profile.module.ts
apps/api/src/projects/projects.controller.ts
apps/api/src/projects/projects.service.ts
apps/api/src/projects/projects.module.ts
apps/api/src/projects/project-resources.service.ts
apps/api/src/technologies/technologies.controller.ts
apps/api/src/technologies/technologies.service.ts
apps/api/src/technologies/technologies.module.ts
apps/api/src/experience/experience.controller.ts
apps/api/src/experience/experience.service.ts
apps/api/src/experience/experience.module.ts
apps/api/src/education/education.controller.ts
apps/api/src/education/education.service.ts
apps/api/src/education/education.module.ts
apps/api/src/certifications/certifications.controller.ts
apps/api/src/certifications/certifications.service.ts
apps/api/src/certifications/certifications.module.ts
apps/api/src/security-labs/security-labs.controller.ts
apps/api/src/security-labs/security-labs.service.ts
apps/api/src/security-labs/security-labs.module.ts
apps/api/test/content.unit.test.ts
apps/api/test/content.integration.test.ts
apps/api/test/isolated-database.ts
docs/public-api.md
docs/public-api-validation.md
```

Se actualizaron `.env.example`, README, documentación de backend y operación, `eslint.config.mjs`, `apps/api/package.json`, el lockfile de la raíz, AppModule, configure-app, configuración de entorno, filtro de errores, HealthController, la fábrica Prisma compartida, la prueba de infraestructura y el smoke test de producción.

## Prisma y datos

No se modificaron modelos, el esquema Prisma, migraciones ni seeds. No se ejecutaron migraciones nuevas o resets. La migración `20261112000100_initial` continúa aplicada y `prisma migrate status` indica base actualizada.

La fábrica compartida ahora pasa el parámetro schema de DATABASE_URL al adaptador PrismaPg. Es necesario para dirigir los clientes de pruebas al esquema aislado; el comportamiento habitual sigue usando public.

Los cinco proyectos reales siguen sin publicar y no hay perfil cargado. No se inventó contenido para poblar la API. Los contadores observados antes de la suite final fueron cinco proyectos, cero publicados y cero perfiles; las pruebas comparan todos los datos reales de public antes y después, además de limpiar sus propios fixtures.

PostgreSQL 18.3 permaneció healthy en el mismo contenedor y puerto `127.0.0.1:55432`. No se recreó el contenedor ni se modificaron o eliminaron sus volúmenes.

## Seguridad validada

- Los filtros SQL incluyen isPublished=true en listado y detalle de proyectos/laboratorios. Recursos privados e inexistentes producen el mismo 404.
- Perfil sin correo privado, singleton, ids ni auditoría. Mensajes de contacto sin rutas públicas.
- Laboratorios sin findings internos; los enlaces asociados solo se exponen tras la aprobación editorial isPublished.
- Despliegues limitados a producción activa con URL; no se exponen regiones, entornos internos ni planes como activos.
- Enums, slugs, booleanos explícitos y enteros acotados; parámetros desconocidos y repetidos rechazados con 400.
- Helmet, CORS restrictivo, ValidationPipe, parsers y logging sanitizado conservados.
- ThrottlerGuard limita por ruta e IP; exceso 429 con Retry-After. Se verificó que un X-Forwarded-For falso no evita la cuota.
- API_RATE_LIMIT=120 por defecto, rango permitido 1–1000, ventana de sesenta segundos. Cabeceras de cuota expuestas por CORS para el frontend.
- OpenAPI nunca se registra en producción. Sin endpoints de escritura, login ni panel administrativo.

## Pruebas ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Aprobado en raíz y workspace API |
| `npm run lint` | Aprobado, sin errores |
| `npm run test:unit` | 10 pruebas aprobadas; 0 fallidas, 0 omitidas |
| `npm run test:integration` | 22 pruebas aprobadas; 0 fallidas, 0 omitidas |
| `npm run api:smoke` | Build real de producción y comprobaciones HTTP aprobadas |
| `npm audit` | 0 vulnerabilidades reportadas |
| `npm run db:status` | Una migración existente, base actualizada |

Las cuatro pruebas unitarias nuevas cubren coerción estricta, límites/enums/slugs, validación de cuota, filtros de publicación idénticos en datos/conteo, paginación estable, recursos ausentes y campos privados excluidos. Se conservan las seis pruebas unitarias de infraestructura.

Las catorce pruebas HTTP nuevas cubren perfil, proyectos, slug, filtros combinados, paginación, orden, relaciones, despliegues, privados/inexistentes, tecnologías, experiencia, educación, certificaciones, laboratorios, validación, ausencia de escrituras/contacto, Swagger, cuota y errores de infraestructura. Se conservan las ocho pruebas HTTP de infraestructura, incluido el timeout real PostgreSQL.

Las fixtures se cargan en un esquema generado `test_portfolio_<uuid>` usando el SQL inicial existente. El esquema y sus datos de prueba se limpian al finalizar; las tablas reales nunca se limpian ni sustituyen. La comparación por hash de todas las tablas de public pasa al cerrar la suite. Una consulta posterior a la primera ejecución confirmó que no quedaron esquemas temporales.

El smoke test ejecuta el build real con NODE_ENV=production y verifica health/readiness 200, listado público 200, Swagger UI/JSON/YAML 404, logs JSON sin contraseña ni token enviado por query, y salida 1 sanitizada ante configuración inválida. Los procesos temporales se terminan al finalizar.

## OpenAPI y dependencias

Instalados `@nestjs/swagger` 12.1.1 y `@nestjs/throttler` 6.7.1, compatibles con NestJS 12.4.2. Prisma permanece en 7.10.1. Se conserva el único lockfile del monorepositorio y el override de minimatch previamente validado.

UI de desarrollo: `/api/v1/docs`. Documentos: `/api/v1/docs-json` y `/api/v1/docs-yaml`. La suite comprueba endpoints, parámetros, DTO y respuestas de error; también comprueba que las tres rutas respondan 404 en producción.

## Git y primer commit

Rama local main. Origin: `https://github.com/koyarxs/Project-06-Portafolio-Noviembre-2026.git`.

La consulta `git ls-remote --symref origin` respondió correctamente y sin referencias durante esta etapa: el remoto no anuncia commits. Tras completar las validaciones, los archivos de las tres etapas se preparan en staging para revisar el primer commit local. Preparar el commit se interpreta como seleccionar y verificar los archivos; no se ejecutan commit ni push, manteniendo la restricción anterior sobre creación de commits sin autorización explícita.

Se revisan exclusiones de `.env`, archivos `.env.*` privados, node_modules, generated y dist. El conjunto versionable se compara con las credenciales locales sin imprimirlas. No se modifica el historial remoto.

## Pendientes y siguiente integración

No quedan bloqueos técnicos observados. Pendiente cargar información profesional verificable y aprobar editorialmente los proyectos y laboratorios que deban publicarse. La bandera isPublished implica revisar la seguridad de todos los textos y documentos enlazados; no hay permisos independientes por archivo en el esquema actual.

La cuota en memoria es suficiente para el proceso local; una futura instalación con varias réplicas necesitará almacenamiento compartido. El override de minimatch debe revisarse cuando sus consumidores incorporen la corrección.

Next.js dispone de contratos JSON uniformes, errores HTTP, CORS local, metadatos de paginación y OpenAPI para generar tipos más adelante. No se implementaron frontend, autenticación, escritura pública ni despliegues.
