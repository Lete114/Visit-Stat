import babel from '@rollup/plugin-babel'
import serve from 'rollup-plugin-serve'
import del from 'rollup-plugin-delete'

export default {
  input: 'client.js',
  output: {
    format: 'iife',
    file: './dist/visit-statis.js'
  },

  plugins: [
    del({ targets: 'dist/*' }),
    serve({ port: 6871, contentBase: ['dist', 'public'] }),
    babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })
  ]
}
