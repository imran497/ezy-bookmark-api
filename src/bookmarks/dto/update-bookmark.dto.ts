import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateBookmarkDto {
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}