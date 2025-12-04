import { db } from '../../lib/db'
import { Injectable } from '@nestjs/common';

@Injectable()
export class DbService {
  db = db
}
