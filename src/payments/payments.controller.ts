import { Controller, Post, Body, UseGuards, Req} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MakePaymentDTO, MakePaymentResponse } from './payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthRequest } from 'src/types/auth.types';
import { MerchantsService } from 'src/merchants/merchants.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private readonly merchantsService: MerchantsService) { }

  /**
   * Endpoint protegido para realizar pagos Lightning
   * Requiere autenticación JWT
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async pay(@Body() body: MakePaymentDTO, @Req() req: AuthRequest): Promise<MakePaymentResponse> {
    const {NWCUrl, amount} = body;
    
    const userPubkey = req.user.pubkey;

    const merchant = await this.merchantsService.findByPubkey(userPubkey);

    const payment = await this.paymentsService.pay(NWCUrl, merchant.lightningAddress, amount);

    return {
      message: "payment succesfull",
      payment
    }
  }
}
