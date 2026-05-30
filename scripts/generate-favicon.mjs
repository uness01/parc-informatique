import sharp from 'sharp'

await sharp('public/logo-maroc.png')
  .resize(32, 32)
  .toFile('public/favicon-32.png')

await sharp('public/logo-maroc.png')
  .resize(16, 16)
  .toFile('public/favicon-16.png')

await sharp('public/logo-maroc.png')
  .resize(180, 180)
  .toFile('public/apple-touch-icon.png')

await sharp('public/logo-maroc.png')
  .resize(32, 32)
  .toFile('app/favicon.ico')

console.log('Done!')
