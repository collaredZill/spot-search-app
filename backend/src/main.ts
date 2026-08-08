import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS（ポート3000からのAPI呼び出し）を許可
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
