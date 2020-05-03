import { Module } from '@nestjs/common';
import { PokerService } from './poker.service';
import { PokerController } from './poker.controller';

@Module({
  providers: [PokerService],
  controllers: [PokerController]
})
export class PokerModule {}
