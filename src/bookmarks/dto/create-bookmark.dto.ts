import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  toolId: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;
}