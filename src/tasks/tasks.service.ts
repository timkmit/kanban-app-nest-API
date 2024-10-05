import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
    subtasks: { id?: string; title: string; description?: string; status: string }[]
  ): Promise<Task> {
    const { title, description, status } = updateTaskDto;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true }, // Загружаем подзадачи для сравнения
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

    return this.prisma.$transaction(async (prisma) => {
      // Обновляем задачу
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title ?? task.title,
          description: description ?? task.description,
          status: status ?? task.status,
        },
      });

      const subtaskIds = subtasks.map((subtask) => subtask.id).filter(Boolean);

      // Удаляем подзадачи, которых нет в запросе
      await prisma.subtask.deleteMany({
        where: {
          taskId: taskId,
          id: { notIn: subtaskIds }, // Удаляем все подзадачи, которых нет в запросе
        },
      });

      // Обрабатываем подзадачи: создаем новые или обновляем существующие
      const subtaskPromises = subtasks.map((subtask) => {
        if (subtask.id) {
          // Обновляем подзадачи, если есть id
          return prisma.subtask.update({
            where: { id: subtask.id },
            data: {
              title: subtask.title,
              description: subtask.description,
              status: subtask.status,
            },
          });
        } else {
          // Создаем подзадачи, если нет id
          return prisma.subtask.create({
            data: {
              title: subtask.title,
              description: subtask.description,
              status: subtask.status,
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
  }
}