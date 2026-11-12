# API REST pública del portafolio

## Arquitectura

Las rutas comparten `/api/v1` y reutilizan ConfigModule, PrismaModule, Helmet, CORS, ValidationPipe y el filtro de errores existentes.

| Módulo | Responsabilidad |
| --- | --- |
| ProfileModule | Perfil profesional público |
| ProjectsModule | Listado y detalle de proyectos publicados |
| TechnologiesModule | Catálogo de tecnologías y filtros |
| ExperienceModule | Trayectoria profesional |
| EducationModule | Formación |
| CertificationsModule | Certificaciones |
| SecurityLabsModule | Laboratorios aprobados para divulgación |

Cada módulo tiene controlador, servicio y configuración Nest. Los DTO de consulta y respuesta están centralizados en `src/common` para conservar un contrato uniforme. ProjectResourcesService compone los selects y filtros de medios y despliegues dentro de la lectura del proyecto, evitando servicios que abran consultas por cada relación.

Los controladores validan y delegan; los servicios aplican las reglas de publicación y consultan Prisma con `select` explícito. La API no devuelve objetos Prisma completos ni entidades internas. No existen repositorios artificiales, un segundo cliente, esquemas Prisma duplicados ni endpoints públicos de escritura.

## Contrato HTTP

Base local: `http://127.0.0.1:3001/api/v1`.

| GET | Parámetros de consulta | Respuesta |
| --- | --- | --- |
| `/profile` | Ninguno | Perfil público o 404 si no existe |
| `/projects` | page, limit, status, type, technology, featured | Proyectos publicados paginados |
| `/projects/:slug` | Ninguno | Proyecto publicado con tecnologías, medios y despliegues |
| `/technologies` | page, limit, category, featured | Catálogo paginado |
| `/technologies/:slug` | Ninguno | Tecnología o 404 |
| `/experience` | page, limit | Experiencia paginada |
| `/education` | page, limit | Educación paginada |
| `/certifications` | page, limit | Certificaciones paginadas |
| `/security-labs` | page, limit, status | Laboratorios publicados paginados |
| `/security-labs/:slug` | Ninguno | Documentación pública del laboratorio o 404 |

Health y readiness siguen disponibles en `/health` y `/health/ready`, con su contrato técnico `{ "status": "ok" }`.

Un detalle o perfil devuelve `{ "data": { ... } }`. Los listados devuelven:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Una página posterior a la última devuelve 200 con data vacío y los totales reales, sin ajustar el número de página solicitado. El conteo y listado se ejecutan en una transacción RepeatableRead para compartir snapshot.

Errores:

```json
{"status":"error","error":{"code":"NOT_FOUND","message":"Not found"}}
```

| HTTP | Significado |
| --- | --- |
| 200 | Consulta correcta, incluso si el listado está vacío |
| 400 | Filtro, slug, paginación o parámetro desconocido inválido |
| 403 | Origen CORS no autorizado |
| 404 | Recurso ausente, privado o ruta inexistente |
| 429 | Cuota agotada; consultar Retry-After |
| 503 | Conexión o disponibilidad de base de datos fallida reconocida |
| 500 | Fallo interno inesperado sanitizado |

No se devuelven mensajes del driver, SQL ni stacks. No hay rutas para ContactMessage. Las solicitudes de escritura a recursos públicos no tienen handlers.

## Validación, filtros y orden

- page: entero decimal de 1 a 100000; valor predeterminado 1.
- limit: entero decimal de 1 a 100; valor predeterminado 20.
- featured: solo `true` o `false`, con conversión explícita. `false` filtra los no destacados; omitirlo incluye ambos.
- status de proyecto: PLANNED, IN_DEVELOPMENT, DEMO_AVAILABLE, COMPLETED, ARCHIVED.
- type: PERSONAL, COMMERCIAL, SAAS, ACADEMIC, OPEN_SOURCE, LABORATORY.
- category: FRONTEND, BACKEND, DATABASE, ORM, DEVOPS, CLOUD, TESTING, SECURITY, MOBILE, TOOLS.
- status de laboratorio: PLANNED, IN_PROGRESS, COMPLETED.
- technology: slug de tecnología, hasta 120 caracteres. La relación se filtra con `some`.
- Slugs de ruta: hasta 220 caracteres, minúsculas ASCII y números separados por guiones simples. No se aceptan espacios, guiones iniciales o finales ni puntuación arbitraria.
- Los parámetros desconocidos y repetidos se rechazan, incluidas combinaciones como `isPublished=false`, `include=private`, `featured=yes`, `page=1e2` o `category=INVALID`.

Todos los filtros se combinan mediante AND. No se permite un campo de ordenamiento arbitrario: proyectos y tecnologías ordenan por sortOrder ascendente y slug ascendente; experiencia por sortOrder, fecha de inicio descendente e id; educación por inicio descendente e id; certificaciones por emisión descendente e id; laboratorios por slug. El desempate estable evita saltos por orden indeterminado. Los id se usan internamente para desempatar sin publicarlos.

Ejemplos de consultas, sin afirmar que esos resultados ya estén publicados:

```text
GET /api/v1/projects?page=1&limit=10&status=COMPLETED&type=PERSONAL
GET /api/v1/projects?technology=typescript&featured=true
GET /api/v1/technologies?category=BACKEND&featured=false
GET /api/v1/security-labs?status=COMPLETED
```

## Política de divulgación

1. **Proyectos:** `isPublished=true` forma parte de la consulta SQL tanto en listados como en detalles. Slug conocido no permite eludirlo. Un proyecto privado y uno inexistente producen el mismo 404.
2. **Perfil:** se publican nombre, título, headline, biografía, ubicación profesional, enlaces profesionales/CV y disponibilidad. El correo se omite porque el modelo no tiene consentimiento de divulgación específico. También se omiten id, singleton y auditoría.
3. **Proyectos y relaciones:** el resumen incluye tecnologías aplanadas. El detalle añade textos técnicos, enlaces públicos, galería ordenada y despliegues. No se devuelven FK, tablas de unión, ids ni auditoría.
4. **Despliegues:** solo PRODUCTION + ACTIVE con URL no nula. No se muestran planes, errores, staging, desarrollo, región ni descripción de infraestructura. La respuesta conserva deploymentStatus=ACTIVE; nunca convierte un plan en despliegue activo.
5. **Laboratorios:** `isPublished` representa la aprobación editorial para divulgar el registro y sus enlaces asociados. Antes de activarlo, el propietario debe comprobar que descripción, metodología, mitigaciones y reportes enlazados son aptos para divulgación. Se excluye siempre `findings`, además de ids y auditoría. El modelo no tiene permisos independientes por documento; no se inventan flags ni se agrega una migración para simularlos.
6. **Trayectoria y catálogo:** los modelos no tienen flag de publicación. Su contenido se considera profesional público por diseño; no almacenar allí información privada. No se inventan registros para completar listados vacíos.
7. **Contacto:** no se consulta ni expone ContactMessage en ningún servicio público.

Prisma carga las relaciones mediante selects anidados con consultas en lote por relación, sin bucles que ejecuten una consulta por proyecto. Listado y conteo tienen un costo acotado; las galerías y despliegues solo se cargan en el detalle.

## Protección contra abuso

`@nestjs/throttler` 6.7.1 aplica un guard global con cuota predeterminada de 120 solicitudes por ruta e IP en 60 segundos. API_RATE_LIMIT acepta valores entre 1 y 1000. Variar el slug o query no crea una ruta nueva para el contador. El exceso responde 429 con Retry-After y error JSON.

La IP proviene de la conexión; no se confía en X-Forwarded-For. Si se introduce un proxy, configurar su confianza explícitamente antes de desplegar. La memoria del limitador pertenece a cada proceso: un despliegue con varias réplicas necesitará almacenamiento compartido, fuera del alcance actual.

Los límites de paginación, el pool PostgreSQL y los timeouts existentes complementan la cuota. CORS expone Retry-After y cabeceras de cuota para que Next.js pueda informar cuándo reintentar.

## OpenAPI

`@nestjs/swagger` 12.1.1 genera documentación desde los controladores y DTO explícitos, sin plugin de compilación adicional.

- UI: `/api/v1/docs`.
- JSON: `/api/v1/docs-json`.
- YAML: `/api/v1/docs-yaml`.
- Solo desarrollo y test; en producción las tres rutas responden 404 y no existe flag público que las habilite.

Se documentan rutas, tags, filtros, enums, límites, DTO de respuesta, envelopes y estados de error. Los ejemplos de parámetros describen sintaxis; no atribuyen certificaciones, fechas o funcionalidades al propietario.

## Ejecución y frontend futuro

Conservar `.env` y el contenedor existentes. Desde la raíz:

```powershell
npm ci
npm run db:generate
npm run api:dev
# O build y proceso compilado:
npm run api:build
npm run api:start
```

Ctrl+C apaga Nest y libera Prisma. No hace falta reiniciar PostgreSQL. La única variable adicional es `API_RATE_LIMIT=120`, incluida en `.env.example`; las demás mantienen su contrato anterior.

Next.js podrá consumir GET, construir URLs de filtros mediante URLSearchParams, leer meta y renderizar estados vacíos. Debe tratar 404 como contenido ausente, 429 según Retry-After y 503 como indisponibilidad temporal. Fechas JSON son ISO 8601; los campos sin información verificada son null. Los consumidores deben tratar los textos como contenido, sin ejecutar HTML arbitrario.

En el estado inicial, no existe perfil, los cinco proyectos del seed están sin publicar y no hay experiencia, educación, certificaciones ni laboratorios cargados. Por eso sus respuestas vacías o 404 son correctas. No se cambió el seed para inventar contenido público.

## Pruebas reproducibles

```powershell
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run api:smoke
npm audit
```

Las pruebas de contenido crean un esquema aleatorio `test_portfolio_<uuid>`, aplican allí el SQL inicial existente y cargan exclusivamente fixtures. El adaptador Prisma respeta el parámetro schema de la URL. No se cambian el esquema Prisma ni las migraciones del proyecto.

Al finalizar se desconectan los clientes y se elimina solo el esquema generado para esa ejecución y sus fixtures. Se comparan hashes de todas las tablas de `public` antes y después para verificar que los datos reales permanecen idénticos. No se limpian ni reemplazan tablas reales. El usuario local debe poder crear esquemas para ejecutar esta suite.

Referencias oficiales: [OpenAPI con Nest](https://docs.nestjs.com/openapi/introduction) y [rate limiting con Nest](https://docs.nestjs.com/security/rate-limiting).
