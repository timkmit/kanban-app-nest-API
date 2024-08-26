import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    SubtasksModule,
    PrismaModule,
  ],
})
export class AppModule {}