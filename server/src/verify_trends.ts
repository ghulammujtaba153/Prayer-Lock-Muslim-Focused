
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Import fully
import { TraderService } from './trader/trader.service';

async function bootstrap() {
  console.log('Bootstrapping App Context...');
  // Set a timeout to force exit if it hangs
  const timeout = setTimeout(() => {
    console.error('Timeout: Application took too long to start.');
    process.exit(1);
  }, 30000); // 30s timeout

  try {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
    console.log('App Context Created.');
    
    const traderService = app.get(TraderService);
    console.log('TraderService retrieved. Calling getEconomicTrends()...');
    
    const trends = await traderService.getEconomicTrends();
    console.log('Successfully fetched trends:', JSON.stringify(trends, null, 2));

    await app.close();
    console.log('App closed.');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    clearTimeout(timeout);
    process.exit(0);
  }
}

bootstrap();
