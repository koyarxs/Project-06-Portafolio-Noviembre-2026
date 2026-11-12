# Operación local

## Variables

| Variable | Ejemplo público | Función |
| --- | --- | --- |
| COMPOSE_PROJECT_NAME | portfolio_noviembre_2026 | Aísla servicios, red y volumen por proyecto |
| POSTGRES_DB | portfolio | Base exclusiva |
| POSTGRES_USER | portfolio_local | Usuario local inicial |
| POSTGRES_PASSWORD | replace_with_local_password | Sustituir en `.env` |
| POSTGRES_PORT | 55432 | Puerto del host, expuesto solo en 127.0.0.1 |
| DATABASE_URL | Ver `.env.example` | Conexión usada por Prisma y verificaciones |

No publicar `.env`. Si cambia usuario, base, contraseña o puerto, sincronizar DATABASE_URL y codificar los caracteres especiales del usuario/contraseña como URL. Las variables exportadas en la terminal pueden prevalecer sobre `.env`; comprobarlas sin imprimir secretos.

## Docker y persistencia

`postgres:18.3-alpine` usa un volumen en `/var/lib/postgresql`, conforme a la distribución de PostgreSQL 18. Compose crea `portfolio_noviembre_2026_postgres_data`. No se fija `container_name`, para mantener el aislamiento que proporciona Compose.

`pg_isready` verifica disponibilidad con el usuario y base configurados; la autenticación y conectividad TCP se comprueban además mediante Prisma y el script de integridad.

```powershell
docker compose config --quiet
docker compose ps
docker compose exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
npm run db:status
npm run db:verify
npm run db:verify-persistence
```

Para detener sin borrar datos, `npm run db:stop`. Para reanudar, `npm run db:up`. No eliminar volúmenes. La recreación de contenedor realizada por la prueba de persistencia compara todas las tablas de `public`, incluido el historial de migraciones, antes y después.

Las variables POSTGRES_* solo inicializan un volumen vacío. Cambiar `.env` no cambia credenciales de una base ya existente. No borrar el volumen para resolver discrepancias: conservar las credenciales originales o efectuar un cambio SQL explícito y coordinado.

El usuario creado por la imagen oficial es superusuario local. No es una configuración de producción ni una cuenta para una API pública. La separación de roles se realizará al preparar despliegues, fuera del alcance actual.

## Diagnóstico

- Motor inaccesible: iniciar Docker Desktop y verificar que está habilitado el motor Linux. En entornos aislados puede requerirse autorización para acceder a la tubería Docker.
- Puerto ocupado: elegir otro POSTGRES_PORT, actualizar DATABASE_URL y recrear únicamente el servicio de este proyecto.
- Error de autenticación: comprobar correspondencia de `.env` con la inicialización del volumen; no imprimir contraseñas en logs compartidos.
- DNS o red restringida: permitir acceso a GitHub, npm y Docker para las operaciones necesarias.
- Cliente ausente: ejecutar `npm run db:generate` después de `npm ci` y tras cambios de esquema.
- Historial de migraciones divergente: inspeccionar `npm run db:status` y el SQL antes de proponer cambios. No ejecutar reset automático.

## Límites actuales

Pendiente confirmar información profesional y detalles de los cinco proyectos. El backend NestJS ofrece health, readiness y consultas REST públicas, sin frontend, autenticación ni despliegues. Las fechas, funcionalidades y relaciones que no fueron aportadas permanecen vacías. Consultar `docs/backend.md` para operar la API y `docs/public-api.md` para el contrato REST.
