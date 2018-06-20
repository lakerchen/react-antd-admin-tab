import fs from 'fs-extra'
import webpackCompiler from '../build/webpack.compiler'
import webpackConfig from '../build/webpack.config'
import path from 'path'
import debug from '../build/debug'

try {
  debug('Compiler begins...')
  debug('process.env.NODE_ENV is : ' + process.env.NODE_ENV)
  debug('Cleaning the `dist` folder...')

  let exec = require('child_process').exec,child;
  child = exec('rm -rf ./dist/*', function(err, out) {
    debug(out);
    err && debug(err);
  });

  debug('Running compiler...')
  webpackCompiler(webpackConfig).then(function(json){
    debug('Compile success.')
  },function(err){
    debug('Compile failed.')
  })

} catch (e) {
  debug('Compiler encountered an error.', e)
  process.exit(1)
}
