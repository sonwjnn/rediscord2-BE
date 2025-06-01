import moduleAlias from 'module-alias'
import { join } from 'path'

const baseDir = join(__dirname, '..')

moduleAlias.addAliases({
  '@': baseDir,
})
