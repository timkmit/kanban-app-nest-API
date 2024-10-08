import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subtask } from '@prisma/client';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  async createSubtask(taskId: string, title: string, description: string, isDone: boolean): Promise<Subtask> {
    return this.prisma.subtask.create({
      data: {
        title,
        description,
        isDone,
        taskId,
      },
    });
  }

  async getSubtasksByTask(taskId: string): Promise<Subtask[]> {
    return this.prisma.subtask.findMany({
      where: { taskId },
    });
  }

  async deleteSubtask(subtaskId: string, taskId: string, userId: string): Promise<void> {
    const subtask = await this.prisma.subtask.findUnique({ where: { id: subtaskId } });
    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const column = await this.prisma.column.findUnique({ where: { id: task.columnId } });
    const board = await this.prisma.board.findUnique({ where: { id: column.boardId } });

    if (board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.subtask.delete({
      where: { id: subtaskId },
    });
  }

  async updateSubtask(
    subtaskId: string, 
    userId: string, 
    title?: string, 
    description?: string, 
    isDone?: boolean | string
  ): Promise<Subtask> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: subtask.taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const column = await this.prisma.column.findUnique({
      where: { id: task.columnId },
    });

    const board = await this.prisma.board.findUnique({
      where: { id: column.boardId },
    });

    if (board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    const isDoneBoolean = isDone === undefined ? undefined : 
                          (typeof isDone === 'string' ? isDone.toLowerCase() === 'true' : isDone);

    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        title,
        description,
        isDone: isDoneBoolean,
      },
    });
  }
}