const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../dist/app.module');
const express = require('express');
const { join } = require('path');
const { existsSync } = require('fs');
require('hbs'); // Force Vercel to include hbs in the deployment

const server = express();
let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    const publicDir = existsSync(join(process.cwd(), 'public'))
      ? join(process.cwd(), 'public')
      : join(__dirname, '..', 'public');

    const viewsDir = existsSync(join(process.cwd(), 'views'))
      ? join(process.cwd(), 'views')
      : join(__dirname, '..', 'views');

    app.useStaticAssets(publicDir);
    app.setBaseViewsDir(viewsDir);
    app.setViewEngine('hbs');
    await app.init();
    cachedApp = server;
  }
  return cachedApp;
}

module.exports = async (req, res) => {
  try {
    if (req.url) {
      if (req.url.startsWith('/api/server.js')) {
        req.url = req.url.replace('/api/server.js', '') || '/';
      } else if (req.url.startsWith('/api/server')) {
        req.url = req.url.replace('/api/server', '') || '/';
      }
    }
    const app = await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error('Error in api/server.js:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Server Error: ' + (err?.stack || err?.message || String(err)));
  }
};
