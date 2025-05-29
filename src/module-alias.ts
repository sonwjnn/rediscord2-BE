import { addAliases } from 'module-alias'
import { join } from 'path'

const baseDir =
  process.env.NODE_ENV === 'production' ? join(__dirname, '..') : __dirname

addAliases({
  '@': baseDir,
})
