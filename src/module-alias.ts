/**
 * Register module aliases for path resolution
 */
import moduleAlias from 'module-alias'
import * as path from 'path'

// Different path resolution for development and production (Vercel)
const rootDir =
  process.env.NODE_ENV === 'production'
    ? '/var/task'
    : path.resolve(__dirname, '..')

// Register the module aliases
moduleAlias.addAliases({
  '@': rootDir,
})
