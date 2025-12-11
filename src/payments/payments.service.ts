import { Injectable } from '@nestjs/common';
import { LN } from "@getalby/sdk";
import { Payment} from './payment.dto';
import { resolveLightningAddress } from './utils/lightning-address.util';
import { getInvoiceFromLNURL } from './utils/lnurl-pay.util';

@Injectable()
export class PaymentsService {
    async pay(NWCUrl: string, lightningAddress: string, amount: number): Promise<Payment> {
        const lnurlPay = await resolveLightningAddress(lightningAddress);

        console.log("LNURLPAY: ", lnurlPay);

        const invoice = await getInvoiceFromLNURL(lnurlPay.callback, amount);

        console.log("generated invoice: ", invoice);

        const ln = new LN(NWCUrl);

        // to send
        return ln.pay(invoice); // pay a lightning invoice
    }
}
