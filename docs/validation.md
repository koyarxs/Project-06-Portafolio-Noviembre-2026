# Informe técnico de inicialización

Fecha de validación: 12 de noviembre de 2026 (contexto del usuario, America/Santiago).

## Git y directorio

- Raíz: `C:\Users\YB\Documents\Github\Project-06-Portafolio-Noviembre-2026`.
- La inspección inicial confirmó una carpeta vacía, sin repositorio Git ni subcarpetas duplicadas.
- Se ejecutó `git init -b main`, autorizado expresamente en la segunda instrucción del usuario.
- Origin: `https://github.com/koyarxs/Project-06-Portafolio-Noviembre-2026.git`.
- `git ls-remote --symref origin` terminó con código 0 y sin referencias: el remoto no tenía commits anunciados al consultarlo.
- Rama local `main`, todavía sin commits. No se ejecutaron clone, commits ni push.
- Los archivos preparados permanecen sin seguimiento; no se hizo staging.
- `.env`, `node_modules` y `generated` están correctamente excluidos según `git check-ignore`.

## Archivos creados

```text
.env.example
.gitignore
README.md
apps/api/.gitkeep
apps/web/.gitkeep
compose.yml
docs/database.md
docs/operations.md
docs/validation.md
package.json
package-lock.json
packages/database/src/client.ts
prisma.config.ts
prisma/schema.prisma
prisma/seed.ts
prisma/migrations/migration_lock.toml
prisma/migrations/20261112000100_initial/migration.sql
scripts/verify-database.ts
scripts/verify-persistence.ts
tsconfig.json
```

Además se generaron `.git`, `.env` con contraseña aleatoria local, dependencias en `node_modules` y el cliente TypeScript en `generated/prisma`. Los tres últimos no se publicarán. No había archivos previos que sobrescribir.

## Versiones comprobadas

| Componente | Versión |
| --- | --- |
| Node.js | 24.22.0 |
| npm | 11.19.1 |
| Docker Engine / CLI | 29.9.2 |
| Docker Compose | 5.6.1 |
| PostgreSQL | 18.3, imagen oficial `postgres:18.3-alpine` |
| prisma / @prisma/client / @prisma/adapter-pg | 7.10.1 |
| pg / @types/pg | 8.23.1 |
| TypeScript | 5.9.3 |
| tsx | 4.23.15 |
| dotenv | 18.0.10 |
| @types/node | 24.19.2 |

Se consultaron versiones en npm y se verificó la imagen en Docker Hub. La etiqueta latest de Prisma anunciaba `8.0.0-rc.33`; se eligió explícitamente la versión estable 7.10.1. `npm install` finalizó con 161 paquetes añadidos y auditoría de 162 paquetes sin vulnerabilidades reportadas en esa ejecución. El lockfile conserva las versiones resueltas.

## Modelos y migración

Implementados: Profile, Technology, Project, ProjectTechnology, ProjectMedia, ProjectDeployment, Experience, Education, Certification, SecurityLab y ContactMessage.

Migración aplicada: `20261112000100_initial`. Incluye tablas, enums, claves primarias, índices únicos y de consulta, claves foráneas, acciones referenciales y CHECK para perfil único e intervalos de fechas.

`prisma migrate status` confirmó una migración y esquema actualizado. `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` finalizó sin diferencias. Esta comparación cubre los elementos representables por Prisma; los CHECK adicionales se verificaron con inserciones inválidas.

## PostgreSQL

- Servicio: `portfolio_noviembre_2026-postgres-1`, estado final `healthy`.
- Base: `portfolio`; usuario exclusivo de desarrollo: `portfolio_local`.
- Puerto publicado: `127.0.0.1:55432`, destino interno 5432.
- Volumen: `portfolio_noviembre_2026_postgres_data`, persistente y conservado durante la recreación.
- `SELECT version()` confirmó PostgreSQL 18.3.
- Conteos finales comprobados: Profile 0, Technology 20, Project 5, ProjectTechnology 0. No se conservaron fixtures de pruebas.

## Pruebas ejecutadas

| Validación | Resultado observado |
| --- | --- |
| Compose: configuración | `docker compose config --quiet`, código 0 |
| Inicio y healthcheck | `docker compose up -d --wait`, healthy |
| Conexión PostgreSQL | Lecturas por Prisma y pg; nombre de base coincide con DATABASE_URL |
| Validación Prisma | Esquema válido |
| Generación de cliente | Cliente 7.10.1 generado correctamente |
| Migración inicial | Aplicada mediante migrate deploy |
| Seed | Completado con 20 tecnologías y 5 proyectos |
| Idempotencia | Dos ejecuciones consecutivas adicionales, mismos registros, IDs y timestamps |
| Slugs únicos | Duplicados rechazados en Project, Technology y SecurityLab |
| Tabla de unión | Relaciones duplicadas rechazadas |
| Integridad referencial | Referencias inexistentes rechazadas para proyectos, tecnologías, medios y despliegues |
| Tecnología en uso | Borrado rechazado por RESTRICT |
| Cascadas | Borrado transaccional del proyecto elimina relaciones, medios y despliegues de prueba |
| Perfil único | Segundo perfil rechazado; singleton=false también rechazado |
| UUID y enums | Valores inválidos rechazados |
| Fechas | Intervalos inválidos rechazados en Project, Experience, Education y Certification |
| Experiencia actual | Fecha de fin incompatible rechazada |
| Reversión de fixtures | ROLLBACK, sin datos sintéticos persistentes |
| Persistencia | Recreación del contenedor y comparación exacta de todas las tablas de public, sin pérdida |
| TypeScript | `tsc --noEmit`, código 0 |
| Correspondencia del esquema | migrate diff sin diferencias |
| Exclusión de secretos | git check-ignore confirma exclusión de .env |

## Incidencias resueltas y pendientes

La red y la tubería Docker no eran accesibles en la ejecución aislada; las operaciones necesarias se ejecutaron con autorización de escalación y funcionaron. No quedan bloqueos de infraestructura observados.

La primera prueba de borrado RESTRICT esperaba SQLSTATE 23503; PostgreSQL 18 devolvió 23001 y bloqueó correctamente el borrado. Se corrigió la expectativa del verificador. La suite completa se repitió con éxito, incluyendo las comprobaciones adicionales de fechas.

Pendiente de contenido: información profesional y detalles verificables de los cinco proyectos. Los borradores se crearon como IN_DEVELOPMENT y sin publicar, sin asignar tipos, funcionalidades, fechas, URLs, relaciones tecnológicas ni despliegues no confirmados.

La configuración implementada es local. No se han inicializado Next.js ni NestJS y no hay frontend, endpoints, autenticación ni despliegues cloud. Estas tareas pertenecen a etapas posteriores.
