import { Test, TestingModule } from '@nestjs/testing';
import { PokerController } from './poker.controller';

describe('Poker Controller', () => {
  let controller: PokerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokerController],
    }).compile();

    controller = module.get<PokerController>(PokerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
