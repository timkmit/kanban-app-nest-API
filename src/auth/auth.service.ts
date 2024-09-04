import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    console.log('User found:', user);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOne(createUserDto.username);
    const existingEmail = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usersService.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
    });

    const payload = { username: newUser.username, email: newUser.email, sub: newUser.id };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }
}