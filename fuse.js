const { FuseBox } = require('fuse-box')

const fuseBackground = FuseBox.init({
  homeDir: 'src',
  target: 'browser@es6',
  output: 'dist/$name.js',
})
fuseBackground.bundle('background').instructions('> background.ts')
fuseBackground.run()

const fuseOptions = FuseBox.init({
  homeDir: 'src',
  target: 'browser@es6',
  output: 'dist/$name.js',
})
fuseOptions.bundle('options').instructions('> options.ts')
fuseOptions.run()
