import { IsNotEmpty, IsString } from 'class-validator';
import { Invoice } from '@getalby/lightning-tools';
import { ApiProperty } from '@nestjs/swagger';

export class MakePaymentDTO {
  @ApiProperty({ example: '', description: 'NWC Url', name: 'NWCUrl' })
  @IsString()
  @IsNotEmpty()
  NWCUrl: string;

  @ApiProperty({ example: '', description: 'Invoice', name: 'invoice' })
  @IsString()
  @IsNotEmpty()
  invoice: string;
}

export type MakePaymentResponse = {
  message: string;
  payment: Payment;
};

// the type that Alby SDK's pay method returns:
export type Payment = {
  invoice: Invoice;
  preimage: string;
  fees_paid: number;
};
