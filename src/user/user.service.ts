import { hashPassword, verifyPassword } from '@/helpers/password';
import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './dto';

@Injectable()
export class UserService {
  constructor(private db: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUserByEmail = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if name already exists (if provided)
    if (createUserDto.name) {
      const existingUserByName = await this.db.user.findUnique({
        where: { name: createUserDto.name },
      });

      if (existingUserByName) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(createUserDto.password);

    // Create the user
    const newUser = await this.db.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      }
    });
    
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { email },
    });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { id },
    });
    return user;
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { name },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const updatedUser = await this.db.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        status: true,
        cleaningDelay: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      },
    });
    return updatedUser;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<Partial<User>> {
    // Find the user
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      updatePasswordDto.currentPassword, 
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(updatePasswordDto.newPassword);

    // Update the password
    const updatedUser = await this.db.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        // Exclude password and other sensitive fields
      },
    });
    
    return updatedUser;
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.db.user.delete({
      where: { id },
    });
    return deletedUser;
  }

  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    const { password: _, ...result } = user;
    return result;
  }
}
