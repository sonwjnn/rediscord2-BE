import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  const port: string | undefined = configService.get('PORT')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  
  app.setGlobalPrefix('api/v1', { exclude: [''] })

  await app.listen(port ?? 8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
