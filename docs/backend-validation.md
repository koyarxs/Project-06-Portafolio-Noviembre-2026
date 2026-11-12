# Informe de validación · Backend NestJS

Fecha: 12 de noviembre de 2026, contexto del usuario America/Santiago.

## Resultado

Backend implementado en `apps/api`, con NestJS 12.4.2, Express y Prisma 7.10.1. Solo se exponen health y readiness bajo `/api/v1`. El esquema, la migración existente, Docker Compose y los datos del portafolio se conservan.

PostgreSQL continúa en el contenedor `portfolio_noviembre_2026-postgres-1`, healthy en `127.0.0.1:55432`. No se recreó ni detuvo durante esta etapa; no se ejecutaron nuevas migraciones ni se eliminaron volúmenes.

## Archivos creados en esta etapa

```text
apps/api/package.json
apps/api/tsconfig.json
apps/api/tsconfig.build.json
apps/api/tsconfig.test.json
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/configure-app.ts
apps/api/src/config/environment.ts
apps/api/src/common/http-exception.filter.ts
apps/api/src/prisma/prisma.module.ts
apps/api/src/prisma/prisma.service.ts
apps/api/src/health/health.module.ts
apps/api/src/health/health.controller.ts
apps/api/test/unit.test.ts
apps/api/test/integration.test.ts
eslint.config.mjs
scripts/smoke-api.mjs
docs/backend.md
docs/backend-validation.md
```

Modificados: `.env.example`, `package.json`, `package-lock.json`, `packages/database/src/client.ts`, `prisma/seed.ts`, `README.md`, `docs/database.md` y `docs/operations.md`.

El seed solo recibió la carga explícita de dotenv al quitar ese efecto secundario de la fábrica compartida. La fábrica ahora acepta conexión configurada, limita el pool y establece timeouts. No se crearon otro esquema, otra instalación independiente ni otro lockfile. Se conservó `apps/api/.gitkeep` conforme a la restricción de no eliminar archivos existentes.

## Versiones instaladas

| Dependencia | Versión |
| --- | --- |
| @nestjs/common, core, platform-express, testing | 12.4.2 |
| @nestjs/config | 12.1.1 |
| Prisma, cliente y adaptador PostgreSQL existentes | 7.10.1 |
| Helmet | 8.3.0 |
| class-validator / class-transformer | 0.15.1 / 0.5.1 |
| reflect-metadata / rxjs | 0.2.2 / 7.8.2 |
| TypeScript existente | 5.9.3 |
| tsc-watch | 7.2.0 |
| ESLint / typescript-eslint | 10.14.0 / 8.72.2 |
| minimatch, override de herramientas de desarrollo | 11.0.1 |

## Resultados ejecutados

| Verificación | Resultado |
| --- | --- |
| `npm run typecheck` | Aprobado en raíz y workspace API |
| `npm run lint` | Aprobado, sin errores |
| `npm run test:unit` | 6 pruebas aprobadas, ninguna omitida |
| `npm run test:integration` | 8 pruebas aprobadas, ninguna omitida |
| `npm run api:build` | Build de producción compilado correctamente |
| `npm run api:smoke` | Ejecutable real en modo producción aprobado; proceso temporal terminado |
| `npm audit` | 0 vulnerabilidades reportadas tras la corrección |
| `npm run db:validate` | Esquema válido |
| `npm run db:status` | Migración inicial existente aplicada; base actualizada |
| `npm run db:verify` | Seed idempotente e integridad de la etapa anterior aprobados; fixtures revertidos |
| `docker compose ps` | Mismo contenedor PostgreSQL, healthy |

Las pruebas unitarias cubren valores predeterminados, validación de puertos/host/entorno/conexión, CORS restrictivo y producción con HTTPS obligatorio, health sin acceso a datos y sanitización de errores Prisma.

Las pruebas de integración arrancan AppModule con PostgreSQL real, verifican el servicio Prisma compartido, endpoints y prefijo, JSON 404, cabeceras Helmet, CORS y preflight, ValidationPipe, tamaño y parseo de cuerpos, errores internos sanitizados y fallo real del handshake PostgreSQL. Ese último test devolvió 503 aproximadamente en 2,05 segundos mientras liveness seguía en 200. El fallo se simula con un servidor TCP local independiente; no se detiene Docker.

La suite de integridad existente ejecuta el seed y fixtures dentro de una transacción revertida. Se comprobó que la adaptación de la fábrica Prisma no rompe las restricciones, slugs, UUID, cascadas, perfil único ni validaciones de fechas de la base existente.

## HTTP y producción

- GET `/api/v1/health`: 200, `{"status":"ok"}`.
- GET `/api/v1/health/ready`: 200 contra PostgreSQL mediante SELECT 1.
- Readiness sin comunicación PostgreSQL: 503, `{"status":"error","error":{"code":"SERVICE_UNAVAILABLE","message":"Service unavailable"}}`.
- Ruta inexistente: JSON 404 uniforme, incluso fuera del prefijo.
- Origen CORS ajeno: 403, sin cabecera de autorización de origen.
- Cuerpo mayor de 32 KiB: 413. JSON malformado: 400.
- Excepción inesperada: 500, sin mensaje interno ni stack.

El smoke test arranca `dist/apps/api/src/main.js` con NODE_ENV=production y un puerto temporal. Verificó health y readiness 200, logs JSON, ausencia de la contraseña de DATABASE_URL y ausencia del token enviado por query. Un segundo proceso con configuración inválida terminó con código 1 y evento startup_failed sin incluir el valor sensible.

Las rutas auxiliares `_test` solo pertenecen al módulo de pruebas y no existen en el ejecutable de producción. El cierre con `app.close()` ejecuta el ciclo de vida Nest; el cliente se desconecta en onModuleDestroy. El bootstrap habilita hooks para señales de apagado.

## Incidencias corregidas

1. NestJS 12 limita su handler 404 al prefijo global; una ruta externa llegaba al HTML predeterminado de Express. Se añadió middleware que envía esas solicitudes al filtro JSON y se verificaron rutas externas y la raíz del prefijo.
2. La auditoría inicial informó diez alertas moderadas derivadas de una sola dependencia transitiva, minimatch 10.2.6, usada por herramientas de lint. Se aplicó un override a 11.0.1, versión corregida según [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). La auditoría posterior reportó cero; lint, tipos, build y pruebas se ejecutaron con la corrección.
3. La primera versión del servidor TCP que simula timeout no consumía el flujo y demoraba su cierre. Se corrigió el fixture para consumir datos sin responder y la prueba terminó correctamente, conservando el timeout real de conexión.
4. ESLint recibió los globals de Node usados por el smoke test JavaScript. La comprobación final no reportó errores.

## Git y preparación del primer commit

Raíz: `C:\Users\YB\Documents\Github\Project-06-Portafolio-Noviembre-2026`.

Rama: `main`, todavía sin commits. Origin: `https://github.com/koyarxs/Project-06-Portafolio-Noviembre-2026.git`.

`git ls-remote --symref origin` terminó con código 0 y sin referencias al inicio y al cierre de esta etapa. El remoto no anuncia commits. No se hizo fetch para sobrescribir contenido, staging, commit, push ni force push.

`git status --short` muestra los archivos de las dos etapas sin seguimiento, listos para revisar. `git check-ignore` confirmó exclusión de `.env`, `.env.production`, `node_modules`, `generated` y `dist`. Los secretos locales permanecen fuera del conjunto versionable; `.env.example` solo incluye valores de muestra.

## Pendientes

No quedan bloqueos de implementación observados. Revisar el override de minimatch cuando sus consumidores incorporen la versión corregida. No se considera este backend un despliegue público: autenticación, contenido, frontend y cloud siguen fuera del alcance autorizado.

La API usada para pruebas se terminó al finalizar; PostgreSQL se dejó operativo. Para iniciar el backend: `npm run api:dev`, o `npm run api:build` seguido de `npm run api:start`. Las instrucciones completas están en `docs/backend.md`.
