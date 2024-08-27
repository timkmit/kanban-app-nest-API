import { ApiProperty } from "@nestjs/swagger";

export class CreateBoardWithColumnsDto {
    @ApiProperty({
      description: 'Название доски',
      example: 'Project Management'
    })
    title: string;
  
    @ApiProperty({
      description: 'Описание доски',
      example: 'A board to manage project tasks',
      required: false
    })
    description?: string;
  
    @ApiProperty({
      description: 'Список колонок для создания',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'To Do' },
          description: { type: 'string', example: 'Tasks that need to be done', nullable: true }
        }
      }
    })
    columns: {
      title: string;
      description?: string;
    }[];
  }
