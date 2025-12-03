import { drizzle } from 'drizzle-orm/node-postgres'
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  db = drizzle({ connection: process.env.DATABASE_URL, casing: 'snake_case' })
}
