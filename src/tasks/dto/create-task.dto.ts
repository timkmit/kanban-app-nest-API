import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
    @ApiProperty({ description: 'ID of the column the task belongs to', example: '670e3e48d5675acc1463883a' })
    columnId: string;
  
    @ApiProperty({ description: 'Title of the task', example: 'Finish documentation' })
    title: string;
  
    @ApiProperty({ description: 'Description of the task', example: 'Complete the API documentation by end of the day' })
    description?: string;
  
    status: string;
  }