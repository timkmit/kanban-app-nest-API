import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(columnId: string, title: string, description: string, status: string): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title,
        description,
        status,
        columnId,
      },
    });
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { columnId },
    });
  }

  async deleteTask(taskId: string, columnId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    const board = await this.prisma.board.findUnique({ where: { id: column.boardId } });

    if (!task || !column || board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}