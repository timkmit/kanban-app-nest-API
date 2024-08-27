import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
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
  }