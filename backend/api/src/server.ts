import { buildApp } from './app'
import { env } from './config/env'
import { logger } from './utils/logger'

async function start() {
  const app = await buildApp()

  try {
    await app.listen({
      host: '0.0.0.0',
      port: env.API_PORT,
    })
  } catch (error) {
    logger.error({ err: error }, 'failed_to_start_api')
    process.exit(1)
  }
}

void start()
