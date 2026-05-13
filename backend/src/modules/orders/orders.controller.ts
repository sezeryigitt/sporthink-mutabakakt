import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrderDetailQuery } from './dto/order-detail.query';
import { OrdersService } from './orders.service';

@Controller('siparisler')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':siparisNo')
  findOne(@Param('siparisNo') siparisNo: string, @Query() query: OrderDetailQuery) {
    return this.ordersService.findOne(siparisNo, query);
  }

  @Get(':siparisNo/finans-ozeti')
  findFinancialSummary(
    @Param('siparisNo') siparisNo: string,
    @Query() query: OrderDetailQuery,
  ) {
    return this.ordersService.findFinancialSummary(siparisNo, query);
  }
}
