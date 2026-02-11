import { Test, TestingModule } from '@nestjs/testing';
import { PerplexityService } from './perplexity.service';

describe('PerplexityService', () => {
  let service: PerplexityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerplexityService],
    }).compile();

    service = module.get<PerplexityService>(PerplexityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
