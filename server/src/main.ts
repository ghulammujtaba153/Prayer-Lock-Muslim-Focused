import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔑 Enable CORS to allow requests from the frontend
  app.enableCors();

  // Listen on port 5000 (specified in your .env)
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
