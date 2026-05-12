import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKategoriDto {
  @ApiProperty({ example: 'Nasi Pedas' })
  @IsString() @IsNotEmpty()
  nama: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  deskripsi?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsInt() @Min(0) @IsOptional()
  urutan?: number;
}
