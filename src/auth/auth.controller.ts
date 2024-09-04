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
  @ApiBody({ type: LoginDto, description: 'Data required to login' })
  @ApiResponse({ status: 200, description: 'Successfully logged in and user details with token returned.', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    const { username, email, password } = loginDto;

    if (!username && !email) {
      throw new BadRequestException('Either username or email must be provided');
    }
    const usernameOrEmail = username || email;

    const user = await this.authService.validateUser(usernameOrEmail, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
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