import { Test, TestingModule } from '@nestjs/testing';
import { PerplexityController } from './perplexity.controller';

describe('PerplexityController', () => {
  let controller: PerplexityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerplexityController],
    }).compile();

    controller = module.get<PerplexityController>(PerplexityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
