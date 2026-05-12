import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Pedas Ayam' })
  @IsString() @IsNotEmpty()
  nama: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  deskripsi?: string;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsNumber() @Min(0)
  harga: number;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  gambar?: string;

  @ApiProperty({ example: 'uuid-kategori-id' })
  @IsUUID()
  kategoriId: string;
}
