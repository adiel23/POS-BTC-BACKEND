import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MakePaymentDTO, MakePaymentResponse } from './payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  /**
   * Endpoint protegido para realizar pagos Lightning
   * Requiere autenticación JWT
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async pay(@Body() body: MakePaymentDTO, @Request() req): Promise<MakePaymentResponse> {
    // El usuario autenticado está disponible en req.user
    const userPubkey = req.user.pubkey;
    console.log(`Pago solicitado por usuario: ${userPubkey}`);

    const payment = await this.paymentsService.pay(body);

    return {
      message: "payment succesfull",
      payment
    }
  }
}
