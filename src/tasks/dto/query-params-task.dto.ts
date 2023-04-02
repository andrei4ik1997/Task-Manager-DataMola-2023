import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { IsOptional } from 'class-validator';
import { DEFAULT_SKIP, DEFAULT_TOP } from '../tasks.constants';
import { Transform } from 'class-transformer';

export class QueryParamsTaskDto {
  @ApiPropertyOptional({
    description: 'How many tasks to skip',
    default: DEFAULT_SKIP,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  skip?: number = DEFAULT_SKIP;

  @ApiPropertyOptional({
    description: 'How many tasks to get',
    default: DEFAULT_TOP,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  top?: number = DEFAULT_TOP;
}
