import del from 'rollup-plugin-delete'
import serve from 'rollup-plugin-serve'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const production = !process.env.ROLLUP_WATCH

const plugins = [
  nodeResolve(),
  !production && serve({ port: 6871, contentBase: ['dist', 'public'] }),
  production && del({ targets: 'dist/*' }),
  babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })
]

export default {
  input: 'client.js',
  plugins,
  output: [
    {
      format: 'iife',
      file: 'dist/visit-stat.js'
    },
    {
      format: 'iife',
      file: 'dist/visit-stat.min.js',
      plugins: [terser()]
    }
  ],
  watch: {
    clearScreen: false
  }
}
