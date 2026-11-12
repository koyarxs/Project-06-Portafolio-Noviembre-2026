import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

export function configureOpenApi(app: NestExpressApplication): void {
  // No hay flag para habilitar documentación públicamente en producción.
  if (app.get(ConfigService).get('NODE_ENV') === 'production') return;
  const options = new DocumentBuilder()
    .setTitle('Portfolio public API')
    .setDescription('Consultas públicas de solo lectura. Los ejemplos no afirman datos reales del propietario. Listados paginados con orden estable; detalles privados devuelven 404.')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: 'api/v1/docs-json', yamlDocumentUrl: 'api/v1/docs-yaml',
    swaggerOptions: { supportedSubmitMethods: ['get'], persistAuthorization: false },
  });
}
