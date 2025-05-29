require('module-alias/register')

// Set up the module aliases
require('module-alias').addAliases({
  '@': __dirname,
  '@/modules': __dirname + '/modules',
  '@/utils': __dirname + '/utils',
  '@/middlewares': __dirname + '/middlewares',
  '@/config': __dirname + '/config',
})

// Import and run the built app
require('./main')
