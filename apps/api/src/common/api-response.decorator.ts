import { applyDecorators, type Type } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiServiceUnavailableResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto, PaginationMetaDto } from './public-response.dto.ts';

export const ApiPublicErrors = () => applyDecorators(
  ApiBadRequestResponse({ type: ErrorResponseDto, description: 'Parámetros inválidos' }),
  ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Recurso inexistente o no publicado' }),
  ApiResponse({ status: 403, type: ErrorResponseDto, description: 'Origen CORS no autorizado' }),
  ApiResponse({ status: 429, type: ErrorResponseDto, description: 'Límite de solicitudes; consultar Retry-After' }),
  ApiServiceUnavailableResponse({ type: ErrorResponseDto, description: 'Servicio temporalmente no disponible' }),
  ApiResponse({ status: 500, type: ErrorResponseDto, description: 'Error interno sanitizado' }),
);

export const ApiItemResponse = (model: Type<unknown>) => applyDecorators(
  ApiExtraModels(model), ApiOkResponse({ schema: {
    type: 'object', required: ['data'], properties: { data: { $ref: getSchemaPath(model) } },
  } }),
);

export const ApiListResponse = (model: Type<unknown>) => applyDecorators(
  ApiExtraModels(model, PaginationMetaDto), ApiOkResponse({ schema: {
    type: 'object', required: ['data', 'meta'], properties: {
      data: { type: 'array', items: { $ref: getSchemaPath(model) } },
      meta: { $ref: getSchemaPath(PaginationMetaDto) },
    },
  } }),
);
