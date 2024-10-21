import { ApiProperty } from '@nestjs/swagger';

export class CreateSubtaskDto {
  @ApiProperty({ description: 'ID задачи, к которой принадлежит подзадача', example: '670e56384e47b0bd2e8ec90c' })
  taskId: string;

  @ApiProperty({ description: 'Название подзадачи', example: 'Создать макет главной страницы' })
  title: string;

  description?: string;

  @ApiProperty({ description: 'Статус подзадачи', example: false })
  isDone: boolean;
}