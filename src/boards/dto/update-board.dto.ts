import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiProperty({ description: 'New title of the board', example: 'New Board Title', required: false })
  title?: string;

  @ApiProperty({ description: 'New description of the board', example: 'Updated description', required: false })
  description?: string;
}