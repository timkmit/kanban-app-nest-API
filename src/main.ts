import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('The Kanban API with full description of requests')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  app.use((req, res, next) => {
    if (req.originalUrl === '/') {
      res.redirect('/api');
    } else {
      next();
    }
  });

  await app.listen(3000);
}
bootstrap();