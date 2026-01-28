import { Test, TestingModule } from '@nestjs/testing';
import { TraderController } from './trader.controller';

describe('TraderController', () => {
  let controller: TraderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraderController],
    }).compile();

    controller = module.get<TraderController>(TraderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
