import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MerchantsService {
    constructor(private prisma: PrismaService) {}
    async findByPubkey(pubkey: string) {
        const merchant = await this.prisma.merchant.findUnique({
            where: {
                pubkey
            }
        });

        if (!merchant) {
            throw new NotFoundException("merchant not found");
        }

        return merchant;
    }
}
