import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { SubtasksController } from './subtasks.controller';

@Module({
  controllers: [SubtasksController],
  imports: [PrismaModule], 
  providers: [SubtasksService]
})
export class SubtasksModule {}
