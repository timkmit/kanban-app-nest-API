import { ApiPropertyOptional } from "@nestjs/swagger";
import { SubtaskDto } from "src/subtasks/dto/subtask.dto";

export class UpdateTaskWithSubtasksDto {
    @ApiPropertyOptional({ required: false })
    title?: string;
  
    @ApiPropertyOptional({ required: false })
    description?: string;
  
    @ApiPropertyOptional({ required: false })
    status?: string;
  
    @ApiPropertyOptional({ type: [SubtaskDto], required: false })
    subtasks?: SubtaskDto[];
  }