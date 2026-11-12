# Backend NestJS

## Estructura y compilación

```text
apps/api/
  package.json                 # Workspace @portfolio/api
  tsconfig.json                # ESM, decoradores y metadata para inyección Nest
  tsconfig.build.json          # Build de producción
  tsconfig.test.json           # Build aislado de pruebas
  src/
    main.ts                    # Arranque, logger JSON y cierre por señales
    app.module.ts              # ConfigModule y HealthModule
    configure-app.ts           # Prefijo, CORS, Helmet, parsers, pipes y filtro
    config/environment.ts      # Validación y selección de archivos de entorno
    common/http-exception.filter.ts
    prisma/prisma.module.ts
    prisma/prisma.service.ts
    health/health.module.ts
    health/health.controller.ts
  test/
    unit.test.ts
    integration.test.ts
```

NestJS 12.4.2 utiliza el adaptador Express predeterminado. La inicialización es manual con TypeScript: no necesita otro lockfile ni una instalación de Nest CLI. Todas las dependencias se resuelven mediante npm workspaces desde la raíz.

La etapa REST incorpora ProfileModule, ProjectsModule, TechnologiesModule, ExperienceModule, EducationModule, CertificationsModule y SecurityLabsModule. Sus contratos y organización se detallan en `public-api.md`; HealthModule y PrismaModule se conservan.

El proyecto sigue siendo ESM. `tsc` emite metadata de decoradores y convierte los imports relativos `.ts` a `.js`, incluyendo el cliente Prisma generado existente. El build queda en `dist/apps/api/src/main.js`, acompañado por `dist/generated/prisma` y `dist/packages/database`. `dist/test` contiene exclusivamente las pruebas compiladas. Todo `dist` está ignorado por Git.

## Entorno

ConfigModule carga variables del proceso, luego `.env.<NODE_ENV>` y por último `.env`, en ese orden de prioridad. NODE_ENV debe proporcionarse en el proceso para seleccionar el archivo de entorno antes de la carga. La raíz se localiza ascendiendo desde el directorio actual hasta `prisma.config.ts`; utilizar los comandos npm del repositorio.

| Variable | Desarrollo | Reglas |
| --- | --- | --- |
| NODE_ENV | development | development, test o production |
| API_HOST | 127.0.0.1 | 127.0.0.1, 0.0.0.0, ::1 o ::; definir exposición conscientemente |
| API_PORT | 3001 | Entero entre 1 y 65535 |
| CORS_ORIGINS | http://localhost:3000 | Lista separada por comas; orígenes exactos, sin comodines, credenciales, paths ni barra final |
| DATABASE_URL | Conservar la existente | URL postgres/postgresql con usuario, contraseña, host y base |
| API_RATE_LIMIT | 120 | Entero de 1 a 1000; solicitudes por ruta e IP cada 60 segundos |

En producción, CORS_ORIGINS es obligatorio y cada origen debe usar HTTPS. No se permite `*`. Las solicitudes sin Origin, como comprobaciones de infraestructura, están permitidas. Los orígenes no autorizados reciben 403 sin cabecera de permiso. CORS regula a navegadores y no reemplaza una futura autenticación.

La API usa GET, HEAD y OPTIONS en la política CORS, sin credenciales y con Content-Type como cabecera permitida. No existe autenticación ni rutas de escritura de contenido.

Ejemplo de inicio con configuración de producción local, en PowerShell:

```powershell
$env:NODE_ENV = 'production'
$env:CORS_ORIGINS = 'https://portfolio.example.com'
npm run api:start
```

El dominio del ejemplo es un valor de configuración de muestra, no un despliegue real. Para volver al modo de desarrollo en esa terminal, quitar esas dos variables con `Remove-Item Env:NODE_ENV` y `Remove-Item Env:CORS_ORIGINS`.

## Prisma y ciclo de vida

PrismaModule exporta una única instancia PrismaService por aplicación Nest. PrismaService crea un solo cliente mediante la fábrica compartida y el adaptador `@prisma/adapter-pg` 7.10.1. No hay esquemas adicionales ni cambios en migraciones o modelos.

Al iniciar se intenta conectar. Si PostgreSQL no está disponible, se registra únicamente el evento `database_unavailable` y la API sigue operativa: liveness devuelve 200 y readiness 503 hasta que una consulta pueda completarse. Cada readiness ejecuta `SELECT 1` mediante Prisma, sin cachear resultados. En el apagado, `onModuleDestroy` desconecta el cliente y su pool.

Pool máximo de cinco conexiones, inactividad de diez segundos, timeout de conexión de dos segundos para la API (cinco por defecto para otros consumidores), timeout SQL de dos segundos y timeout de consulta del driver de 2,5 segundos. Estos límites acotan las comprobaciones ante fallos; deben revisarse cuando se implementen consultas de contenido más largas.

La fábrica compartida no carga `.env` como efecto secundario: Nest utiliza ConfigModule y el seed carga dotenv explícitamente. No se imprimen cadenas de conexión ni errores internos del driver.

## Endpoints

Además de los endpoints técnicos siguientes, existen las rutas públicas descritas en `public-api.md`. Swagger está disponible en `/api/v1/docs` en desarrollo y pruebas; UI y documentos raw están deshabilitados en producción.

| Método y ruta | Resultado |
| --- | --- |
| GET /api/v1/health | 200 si Nest atiende solicitudes |
| GET /api/v1/health/ready | 200 si SELECT 1 funciona; 503 si falla |

Respuesta correcta:

```json
{"status":"ok"}
```

Respuesta de readiness fallida:

```json
{"status":"error","error":{"code":"SERVICE_UNAVAILABLE","message":"Service unavailable"}}
```

Los demás errores usan la misma estructura, con un código adecuado al estado HTTP. No contienen SQL, valores de entrada, URLs internas, errores del driver ni stacks. Las rutas desconocidas, incluso fuera del prefijo, devuelven JSON 404.

## Seguridad y observabilidad

- Helmet configura cabeceras de seguridad y se elimina `X-Powered-By`.
- JSON y formularios URL-encoded limitados a 32 KiB; formularios a cien parámetros. Los errores de parseo y tamaño se normalizan a 400 y 413.
- ValidationPipe global transforma DTO, restringe propiedades y rechaza campos adicionales. Los endpoints públicos validan slugs, filtros y paginación; la ruta de escritura usada para verificar DTO de cuerpo existe únicamente en pruebas.
- ThrottlerGuard limita cada ruta por IP, devuelve 429 con Retry-After y no confía en X-Forwarded-For. Las cabeceras de cuota y reintento se exponen mediante CORS para el futuro frontend.
- Logging JSON mediante ConsoleLogger. Los eventos HTTP incluyen método, estado y duración; no incluyen URL, query, cuerpos, cabeceras ni credenciales.
- Los errores internos registran solo evento y estado. Producción limita los niveles a log, warn y error. El fallo de arranque tiene mensaje genérico y código de salida de error.
- Timeouts HTTP: solicitud 15 s, cabeceras 10 s y keep-alive 5 s. El timeout de solicitud limita recepción, no sustituye los timeouts del driver PostgreSQL.
- No se confía automáticamente en proxies y no se agregan autenticación, JWT ni infraestructura cloud.

Las dependencias de lint usan un override temporal de minimatch 11.0.1 por [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). El cambio de versión mayor se verificó con lint, typecheck, build y pruebas. Revisar su necesidad cuando los paquetes consumidores incorporen la corrección.

## Inicio y apagado

Desde la raíz, conservar `.env` y PostgreSQL existentes:

```powershell
npm ci
npm run db:generate
npm run api:build
npm run api:start
# En otra terminal:
Invoke-RestMethod http://127.0.0.1:3001/api/v1/health
Invoke-RestMethod http://127.0.0.1:3001/api/v1/health/ready
```

Para desarrollar, `npm run api:dev`: tsc-watch compila con metadata y reinicia el proceso cuando cambia el código. Ctrl+C detiene la API; los hooks de Nest desconectan Prisma. No detener ni recrear PostgreSQL para reiniciar el backend.

## Validación

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run api:build
npm run api:smoke
npm audit
```

Las pruebas usan el runner nativo de Node y `@nestjs/testing`, con TypeScript compilado para conservar metadata. Las pruebas de infraestructura cubren configuración, liveness, readiness, CORS, Helmet, parsers, ValidationPipe y errores. Las pruebas REST usan fixtures en un esquema temporal independiente y comprueban el contrato de contenido; no escriben en `public`.

`api:smoke` compila y arranca temporalmente el ejecutable de producción en un puerto libre, verifica ambos endpoints y comprueba que los logs sean JSON y no contengan ni la contraseña de conexión ni un token de prueba enviado por query. También confirma que una configuración inválida termina con código 1 y un error sanitizado. El script termina el proceso hijo al finalizar; los tests de integración comprueban el cierre de la aplicación mediante `app.close()` y sus hooks.

Para simular una base caída, el test usa un servidor TCP local que no responde al handshake PostgreSQL y comprueba el timeout. No modifica DATABASE_URL real, no para Docker, no crea tablas ni escribe datos. Los servidores y aplicaciones de pruebas se cierran al finalizar. Las rutas `_test` solo existen en el módulo de pruebas; no se importan en producción.

Referencias oficiales: [configuración Nest](https://docs.nestjs.com/techniques/configuration), [logging JSON](https://docs.nestjs.com/techniques/logger), [CORS](https://docs.nestjs.com/security/cors), [Helmet](https://docs.nestjs.com/v11/security/helmet) y [pool con adaptadores Prisma](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool).
