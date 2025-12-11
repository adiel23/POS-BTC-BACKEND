import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import {Invoice} from "@getalby/lightning-tools";

export class MakePaymentDTO {
    @IsString()
    @IsNotEmpty()
    NWCUrl: string

    @IsNumber()
    amount: number
}

export type MakePaymentResponse = {
    message: string;
    payment: Payment;
}

// the type that Alby SDK's pay method returns:
export type Payment = {
    invoice: Invoice;
    preimage: string;
    fees_paid: number;
}