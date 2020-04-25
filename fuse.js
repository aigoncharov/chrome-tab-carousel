const { FuseBox } = require('fuse-box')

const fuse = FuseBox.init({
  homeDir: 'src',
  target: 'browser@es6',
  output: 'dist/$name.js',
})
fuse.bundle('background').instructions('> background.ts').watch()
fuse.run()
