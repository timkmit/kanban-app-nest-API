import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskWithSubtasksDto } from './dto/createWithSubtasck.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(columnId: string, title: string, description?: string, status?: string): Promise<{ id: string; title: string; columnId: string; description: string }> {
    const taskDescription = description ?? "";
    const taskStatus = status ?? "";

    const newTask = await this.prisma.task.create({
        data: {
            title,
            description: taskDescription,
            status: taskStatus,
            columnId,
        },
    });

    return {
        id: newTask.id,
        title: newTask.title,
        columnId: newTask.columnId,
        description: newTask.description,
    };
}

async createTaskWithSubtasks(body: CreateTaskWithSubtasksDto) {
  const { columnId, title, description, subtasks } = body;

  try {
      const task = await this.prisma.task.create({
          data: {
              title,
              description: description ?? "", 
              status: "", 
              columnId,
              subtasks: {
                  create: subtasks.map((subtask) => ({
                      title: subtask.title,
                      isDone: false, 
                  })),
              },
          },
          include: {
              subtasks: true,
          },
      });

      const filteredTask = {
          id: task.id,
          title: task.title,
          columnId: task.columnId,
          description: task.description, 
          subtasks: task.subtasks.map(subtask => ({
              id: subtask.id,
              title: subtask.title,
              isDone: subtask.isDone, 
          })),
      };

      return { task: filteredTask };
  } catch (error) {
      console.error('Error creating task with subtasks:', error);
      throw new InternalServerErrorException('Error creating task with subtasks');
  }
}

  async getTasksByColumn(columnId: string): Promise<{ id: string; title: string; columnId: string }[]> {
    return this.prisma.task.findMany({
      where: { columnId },
      select: {
        id: true,
        title: true,
        columnId: true,
      },
    });
  }

  async moveTaskToNewColumn(taskId: string, newColumnId: string): Promise<any> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
  
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,
      },
    });

    const updatedColumn = await this.prisma.column.findUnique({
      where: { id: newColumnId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,  
            subtasks: {
              select: {
                id: true,
                title: true,  
              },
            },
          },
        },
      },
    });
  
    if (!updatedColumn) {
      throw new NotFoundException('New column not found');
    }
  
    return updatedColumn;
  }

  async deleteTask(taskId: string, columnId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    const board = await this.prisma.board.findUnique({ where: { id: column.boardId } });
  
    if (!task || !column || board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.subtask.deleteMany({
      where: { taskId },
    });

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async updateTask(taskId: string, userId: string, title?: string, description?: string, status?: string): Promise<{ id: string; title: string; columnId: string; description: string }> {
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
            title: title ?? task.title,
            description: description ?? task.description, 
            status: status ?? task.status, 
        },
        select: {
            id: true,
            title: true,
            columnId: true,
            description: true, 
        },
    });
}



async updateTaskWithSubtasks(
  taskId: string,
  userId: string,
  updateTaskDto: UpdateTaskDto,
  subtasks: { id?: string; title: string; isDone: boolean }[],
  newColumnId: string
): Promise<{ task: { id: string; title: string; columnId: string; description: string; subtasks: { id: string; title: string; isDone: boolean }[] } }> {
  const { title, description, status } = updateTaskDto;

  const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
  });

  if (!task) {
      throw new NotFoundException('Task not found');
  }

  const column = await this.prisma.column.findUnique({
      where: { id: newColumnId },
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
                  columnId: newColumnId,
              },
          });

          const subtaskIds = subtasks.map((subtask) => subtask.id).filter(Boolean);

          await prisma.subtask.deleteMany({
              where: {
                  taskId: taskId,
                  id: { notIn: subtaskIds },
              },
          });

          const subtaskPromises = subtasks.map(async (subtask) => {
              if (subtask.id) {
                  return prisma.subtask.update({
                      where: { id: subtask.id },
                      data: {
                          title: subtask.title,
                          isDone: subtask.isDone ?? false,
                      },
                  });
              } else {
                  return prisma.subtask.create({
                      data: {
                          title: subtask.title,
                          isDone: subtask.isDone ?? false,
                          taskId: taskId,
                      },
                  });
              }
          });

          await Promise.all(subtaskPromises);

          const taskWithSubtasks = await prisma.task.findUnique({
              where: { id: updatedTask.id },
              include: { subtasks: true },
          });

          const filteredTask = {
              id: taskWithSubtasks.id,
              title: taskWithSubtasks.title,
              columnId: taskWithSubtasks.columnId,
              description: taskWithSubtasks.description, 
              subtasks: taskWithSubtasks.subtasks.map(subtask => ({
                  id: subtask.id,
                  title: subtask.title,
                  isDone: subtask.isDone,
              })),
          };

          return { task: filteredTask };
      });
  } catch (error) {
      console.error('Failed to update or create subtasks:', error);
      throw new InternalServerErrorException('Failed to update or create subtasks');
  }
}
}