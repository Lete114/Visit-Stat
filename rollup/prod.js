import babel from '@rollup/plugin-babel'
import del from 'rollup-plugin-delete'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'client.js',
  output: [
    {
      format: 'iife',
      file: './dist/visit-statis.js'
    },
    {
      format: 'iife',
      file: './dist/visit-statis.min.js',
      plugins: [terser()]
    }
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })
  ]
}
