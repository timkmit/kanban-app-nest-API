import { Controller, Post, Body, Request, UseGuards, Get, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Registers a new user and returns user details with JWT token.' })
  @ApiBody({ type: CreateUserDto, description: 'Data required to register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 409, description: 'Conflict: Username or email already exists.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login', description: 'Logs in a user and returns user details with JWT token.' })
  @ApiBody({ 
    type: LoginDto, 
    description: 'Data required to login', 
    examples: {
      default: {
        summary: 'Email and Password',
        value: {
          email: 'testuser@mail.ru',
          password: 'password123'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Successfully logged in and user details with token returned.', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request: Incorrect input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const { username, email, password } = loginDto;
  
    // Проверяем наличие хотя бы одного из полей
    if (!username && !email) {
      throw new BadRequestException('Either username or email must be provided');
    }
  
    // Проверяем, что предоставлен только один из параметров
    if (username && email) {
      throw new BadRequestException('Use only one of the parameters: username or email');
    }
  
    // Определяем, что именно предоставлено
    let user;
    if (username) {
      if (this.isEmail(username)) {
        throw new BadRequestException('Provided username cannot be an email address');
      }
      // Проверяем пользователя по username
      user = await this.authService.validateUser(username, password);
    } else if (email) {
      if (!this.isEmail(email)) {
        throw new BadRequestException('Provided email is not in a valid email format');
      }
      // Проверяем пользователя по email
      user = await this.authService.validateUser(email, password);
    }
  
    // Проверяем, что пользователь найден и аутентифицирован
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    return this.authService.login(user);
  }
  
  // Метод для проверки формата email
  private isEmail(value: string): boolean {
    // Простейшая проверка на email
    // Можно использовать более сложное регулярное выражение при необходимости
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile', description: 'Returns the profile of the authenticated user.' })
  @ApiResponse({ status: 200, description: 'User profile returned.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing token.' })
  getProfile(@Request() req) {
    console.log('User from req:', req.user);
    return {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    };
  }
}