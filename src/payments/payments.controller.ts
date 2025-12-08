import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MakePaymentDTO, MakePaymentResponse} from './payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async pay(@Body() body: MakePaymentDTO): Promise<MakePaymentResponse> {
    const payment = await this.paymentsService.pay(body);

    return {
      message: "payment succesfull",
      payment
    }
  }
}
