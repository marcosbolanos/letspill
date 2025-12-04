import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';

import { auth } from "../lib/auth";

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    UsersModule,
    DbModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
