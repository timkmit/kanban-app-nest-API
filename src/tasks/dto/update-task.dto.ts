import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'The title of the task' })
  title?: string;

  @ApiPropertyOptional({ description: 'A description of the task' })
  description?: string;

  status?: string;
}
