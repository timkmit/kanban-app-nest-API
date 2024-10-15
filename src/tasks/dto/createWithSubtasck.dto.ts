import { ApiProperty } from "@nestjs/swagger";
import { CreateSubtaskDto } from "src/subtasks/dto/create-subtask.dto";

export class CreateTaskWithSubtasksDto {
    @ApiProperty({ description: 'ID колонки, к которой принадлежит задача', example: '670e56384e47b0bd2e8ec90c' })
    columnId: string;
  
    @ApiProperty({ description: 'Название задачи', example: 'Создать веб-сайт' })
    title: string;
  
    @ApiProperty({ description: 'Описание задачи', example: 'Создать веб-сайт для проекта' })
    description: string;
  
    @ApiProperty({ description: 'Статус задачи', example: 'in-progress' })
    status: string; 
  
    @ApiProperty({ type: [CreateSubtaskDto] })
    subtasks: CreateSubtaskDto[];
}
