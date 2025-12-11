import { InternalServerErrorException } from '@nestjs/common';

export async function resolveLightningAddress(address: string) {
    const [username, domain] = address.split('@');

    if (!username || !domain) {
      throw new Error('Invalid lightning address');
    }

    const url = `https://${domain}/.well-known/lnurlp/${username}`;

    try {

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to resolve lightning address');

        const data = await res.json();

        if (!data || !data.callback) {
            throw new Error('Invalid LNURL-pay response');
        }

        return data; 
    } catch (err) {
        console.error(err);
        throw new InternalServerErrorException('Could not resolve lightning address');
    }
}
