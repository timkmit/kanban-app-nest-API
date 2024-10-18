import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Column } from '@prisma/client';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async createColumn(userId: string, boardId: string, title: string, description: string): Promise<Column> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { boardShares: true },
    });

    if (!board || (board.userId !== userId && !board.boardShares.some(share => share.userId === userId))) {
      throw new ForbiddenException('Access Denied');
    }

    return this.prisma.column.create({
      data: {
        title,
        description,
        boardId,
      },
    });
  }

  async getColumnsByBoard(userId: string, boardId: string): Promise<Column[]> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { boardShares: true },
    });

    if (!board || (board.userId !== userId && !board.boardShares.some(share => share.userId === userId))) {
      throw new ForbiddenException('Access Denied');
    }

    return this.prisma.column.findMany({
      where: { boardId },
    });
  }

  async updateColumn(userId: string, columnId: string, title?: string, description?: string): Promise<Column> {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    const board = await this.prisma.board.findUnique({ where: { id: column.boardId } });

    if (!column || board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        title: title ?? column.title,
        description: description ?? column.description,
      },
    });
  }

  async deleteColumn(userId: string, columnId: string, boardId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { boardShares: true },
    });
  
    if (!board || (board.userId !== userId && !board.boardShares.some(share => share.userId === userId))) {
      throw new ForbiddenException('Access Denied');
    }
  
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
  
    if (!column) {
      throw new ForbiddenException('Column not found');
    }

    const tasks = await this.prisma.task.findMany({
      where: { columnId: columnId },
    });

    const taskIds = tasks.map(task => task.id);
    await this.prisma.subtask.deleteMany({
      where: { taskId: { in: taskIds } },
    });

    await this.prisma.task.deleteMany({
      where: { columnId: columnId },
    });

    await this.prisma.column.delete({
      where: { id: columnId },
    });
  }
}