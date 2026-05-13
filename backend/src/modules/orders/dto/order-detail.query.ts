import { IsOptional, Matches } from 'class-validator';

export class OrderDetailQuery {
  @IsOptional()
  @Matches(/^[1-9]\d*$/)
  pazaryeri_id?: string;
}
