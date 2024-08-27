import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Board } from '@prisma/client';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

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
        userId: userId, 
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

  async getUserBoardsWithDetails(userId: string): Promise<CreateBoardDto[]> {
    return this.prisma.board.findMany({
      where: {
        userId: userId,
      },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
        boardShares: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async shareBoard(boardId: string, ownerId: string, email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const board = await this.prisma.board.findUnique({ where: { id: boardId } });

    if (!board || board.userId !== ownerId) {
      throw new ForbiddenException('Access Denied');
    }

    await this.prisma.boardShare.create({
      data: {
        boardId,
        userId: user.id,
      },
    });
  }

  async updateBoard(boardId: string, userId: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const { title, description } = updateBoardDto;

    // Найти доску по ID
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board || board.userId !== userId) {
      throw new ForbiddenException('Access Denied');
    }

    return this.prisma.board.update({
      where: { id: boardId },
      data: {
        title: title ?? board.title,
        description: description ?? board.description,
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