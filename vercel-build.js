const { execSync } = require('child_process')

// This script runs during Vercel build
;(async () => {
  try {
    console.log('🔄 Running Prisma generate')
    execSync('pnpx prisma generate --schema=src/db/schema.prisma', {
      stdio: 'inherit',
    })

    console.log('🔨 Building NestJS application')
    execSync('pnpx nest build', { stdio: 'inherit' })

    console.log('✅ Build completed successfully')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
})()
