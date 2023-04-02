import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger';

export function CreateApiQueryDecorator(
  fieldName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  fieldDto: Function,
) {
  return applyDecorators(
    ApiExtraModels(fieldDto),
    ApiQuery({
      required: false,
      name: fieldName,
      style: 'deepObject',
      explode: true,
      type: 'object',
      schema: {
        $ref: getSchemaPath(fieldDto),
      },
    }),
  );
}
