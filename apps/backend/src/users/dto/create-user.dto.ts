import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  nama: string;

  @ApiProperty()
  @IsString() @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.KASIR })
  @IsEnum(UserRole)
  role: UserRole = UserRole.KASIR;
}
