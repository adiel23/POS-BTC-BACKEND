import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly config: ConfigService) {
    const adapter = new PrismaMariaDb({
        user: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT')
    });
    super({ adapter });
  }
}
