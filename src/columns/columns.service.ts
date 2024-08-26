import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Column } from '@prisma/client';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async createColumn(userId: string, boardId: string, title: string, description: string): Promise<Column> {
    // Проверка доступа к доске
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
    // Проверка доступа к доске
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

  async deleteColumn(userId: string, columnId: string, boardId: string): Promise<void> {
    // Проверка доступа к доске
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

    await this.prisma.column.delete({
      where: { id: columnId },
    });
  }
}