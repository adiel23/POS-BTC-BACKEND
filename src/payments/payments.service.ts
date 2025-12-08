import { Injectable } from '@nestjs/common';
import { LN } from "@getalby/sdk";
import { MakePaymentDTO, Payment} from './payment.dto';

@Injectable()
export class PaymentsService {
    async pay({NWCUrl, invoice}: MakePaymentDTO): Promise<Payment> {
        const ln = new LN(NWCUrl);

        // to send
        return ln.pay(invoice); // pay a lightning invoice
    }
}
