import { InternalServerErrorException } from '@nestjs/common';

export async function getInvoiceFromLNURL(callback: string, amountSats: number) {
  try {
    const amountMsats = amountSats * 1000;

    const url = `${callback}?amount=${amountMsats}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.pr) {
      throw new Error('Invalid invoice response');
    }

    return data.pr; // bolt11 invoice
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException('Could not generate invoice from LNURL');
  }
}
