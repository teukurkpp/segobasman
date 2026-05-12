import { IsArray, IsInt, IsNotEmpty, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  menuId: string;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString() @IsNotEmpty() @MinLength(2)
  namaPelanggan: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
