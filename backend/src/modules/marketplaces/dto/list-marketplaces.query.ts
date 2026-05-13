import { IsIn, IsOptional } from 'class-validator';

export class ListMarketplacesQuery {
  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  aktif_mi?: string;
}
