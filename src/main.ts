import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common'
import validationOptions from '@/utils/validation-options'
import { ResolvePromisesInterceptor } from '@/middlewares/interceptors/serializer.interceptor'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllConfigType } from '@/config/config.type'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService<AllConfigType>)

  // Enable CORS
  app.enableCors({
    origin: [configService.getOrThrow('app.frontendDomain', { infer: true })],
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe(validationOptions))

  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  )
  app.enableVersioning({
    type: VersioningType.URI,
  })

  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  )

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: 'x-custom-lang',
      schema: {
        example: 'en',
      },
    })
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document)

  await app.listen(configService.getOrThrow('app.port', { infer: true }))
}
void bootstrap()
