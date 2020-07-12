import { Module } from '@nestjs/common';
import { PokerService } from './poker.service';
import { PokerGateway } from './poker.gateway';
import { PokerController } from './poker.controller';

@Module({
  providers: [PokerService, PokerGateway],
  controllers: [PokerController]
})
export class PokerModule { }
