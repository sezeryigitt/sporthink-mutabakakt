import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseBigIntIdPipe } from '../../common/pipes/parse-bigint-id.pipe';
import { ListMarketplacesQuery } from './dto/list-marketplaces.query';
import { MarketplacesService } from './marketplaces.service';

@Controller('pazaryerleri')
export class MarketplacesController {
  constructor(private readonly marketplacesService: MarketplacesService) {}

  @Get()
  findAll(@Query() query: ListMarketplacesQuery) {
    return this.marketplacesService.findAll(query);
  }

  @Get(':id/hesaplar')
  findAccounts(@Param('id', ParseBigIntIdPipe) id: string) {
    return this.marketplacesService.findAccounts(id);
  }
}
