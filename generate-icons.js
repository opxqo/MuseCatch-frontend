const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public/icons/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [192, 512];

Promise.all(sizes.map(size => 
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, `public/icons/icon-${size}x${size}.png`))
    .then(() => console.log(`Generated icon-${size}x${size}.png`))
)).then(() => {
  console.log('All icons generated!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
