import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Board } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async createBoard(userId: string, title: string, description: string): Promise<Board> {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    return this.prisma.board.create({
      data: {
        title: title,
        description: description,
        userId: userId, // Это правильное поле
      },
    });
  }

  async createBoardWithColumns(userId: string, title: string, description: string, columns: { title: string; description?: string }[]): Promise<Board> {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    return this.prisma.$transaction(async (prisma) => {
      const board = await prisma.board.create({
        data: {
          title,
          description,
          userId,
        },
      });

      const columnPromises = columns.map(column =>
        prisma.column.create({
          data: {
            title: column.title,
            description: column.description,
            boardId: board.id,
          },
        }),
      );

      await Promise.all(columnPromises);

      return board;
    });
  }

  async getUserBoards(userId: string): Promise<Board[]> {
    return this.prisma.board.findMany({
      where: {
        OR: [
          { userId },
          { boardShares: { some: { userId } } }
        ]
      },
    });
  }

  async shareBoard(boardId: string, ownerId: string, userId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== ownerId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.boardShare.create({
      data: {
        boardId,
        userId,
      },
    });
  }

  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board || board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.boardShare.deleteMany({
      where: { boardId: boardId },
    });

  
    await this.prisma.board.delete({
      where: { id: boardId },
    });
  }
}