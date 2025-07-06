import { IsString, IsOptional, IsArray, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateToolDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  url: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsUrl({}, { message: 'Favicon must be a valid URL' })
  @MaxLength(2048, { message: 'Favicon URL must not exceed 2048 characters' })
  favicon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'AddedBy must not exceed 100 characters' })
  addedBy?: string;
}