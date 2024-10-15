import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  async createSubtask(taskId: string, title: string, description?: string, isDone?: boolean): Promise<{ id: string; title: string; taskId: string }> {
    return this.prisma.subtask.create({
      data: {
        title,
        description: description ?? "", 
        isDone: isDone ?? false, 
        taskId,
      },
      select: {
        id: true,
        title: true,
        taskId: true, 
      },
    });
  }

  async getSubtasksByTask(taskId: string): Promise<{ id: string; title: string; taskId: string }[]> {
    return this.prisma.subtask.findMany({
      where: { taskId },
      select: {
        id: true,
        title: true,
        taskId: true, 
      },
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
    isDone?: boolean | string
  ): Promise<{ id: string; title: string; taskId: string }> {
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
  
    const isDoneBoolean = isDone === undefined ? false : 
                          (typeof isDone === 'string' ? isDone.toLowerCase() === 'true' : isDone);
  
    const updatedSubtask = await this.prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        title,
        isDone: isDoneBoolean,
      },
    });
  
    return {
      id: updatedSubtask.id,
      title: updatedSubtask.title,
      taskId: updatedSubtask.taskId, 
    };
  }
}