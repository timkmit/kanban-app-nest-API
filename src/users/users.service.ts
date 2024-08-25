import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: '$2b$10$z8zEBZk8pKmT8hpLxqkJ1O7h5LL7pOiIG8GOpMQR0F0WZ7Dk8JGzS', // 'changeme' hashed
    },
  ];

  async findOne(username: string): Promise<any | undefined> {
    return this.users.find(user => user.username === username);
  }

  async create(user: any): Promise<any> {
    this.users.push(user);
    return user;
  }
}