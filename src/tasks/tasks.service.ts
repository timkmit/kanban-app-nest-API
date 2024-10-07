import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';

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

  async updateTask(taskId: string, userId: string, title?: string, description?: string, status?: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const column = await this.prisma.column.findUnique({
      where: { id: task.columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: column.boardId },
    });

    if (board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
      },
    });
  }



  async updateTaskWithSubtasks(
    taskId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
    subtasks: { id?: string; title: string; description?: string; isDone: boolean }[]
  ): Promise<Task> {
    const { title, description, status } = updateTaskDto;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const column = await this.prisma.column.findUnique({
      where: { id: task.columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: column.boardId },
    });

    if (board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: {
            title: title ?? task.title,
            description: description ?? task.description,
            status: status ?? task.status,
          },
        });

        const subtaskIds = subtasks.map((subtask) => subtask.id).filter(Boolean);

        // Delete subtasks that are not in the updated list
        await prisma.subtask.deleteMany({
          where: {
            taskId: taskId,
            id: { notIn: subtaskIds },
          },
        });

        const subtaskPromises = subtasks.map(async (subtask) => {
          if (subtask.id) {
            return prisma.subtask.upsert({
              where: { id: subtask.id },
              update: {
                title: subtask.title,
                description: subtask.description,
                isDone: subtask.isDone,
              },
              create: {
                title: subtask.title,
                description: subtask.description,
                isDone: subtask.isDone,
                taskId: taskId,
              },
            });
          } else {
            return prisma.subtask.create({
              data: {
                title: subtask.title,
                description: subtask.description,
                isDone: subtask.isDone,
                taskId: taskId,
              },
            });
          }
        });

        await Promise.all(subtaskPromises);

        return prisma.task.findUnique({
          where: { id: updatedTask.id },
          include: { subtasks: true },
        });
      });
    } catch (error) {
      console.error('Failed to update or create subtasks:', error);
      throw new InternalServerErrorException('Failed to update or create subtasks');
    }
  }
}