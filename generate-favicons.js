const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\yunus\\.gemini\\antigravity\\brain\\81fb4a61-adfa-483e-91cc-e6cdb90278ca\\media__1783263766233.png';
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

async function generate() {
    console.log('Loading source image from ' + srcPath + '...');
    const image = await Jimp.read(srcPath);

    // Ensure it's square
    const width = image.getWidth();
    const height = image.getHeight();
    const size = Math.min(width, height);
    image.crop((width - size) / 2, (height - size) / 2, size, size);

    console.log('Making background transparent...');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        if (r > 245 && g > 245 && b > 245) {
            this.bitmap.data[idx + 3] = 0; // Transparent
        }
    });

    const sizes = {
        'favicon-16.png': 16,
        'favicon-32.png': 32,
        'favicon-48.png': 48,
        'apple-touch-icon.png': 180,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
        'favicon.png': 32
    };

    const pngBuffers = {};

    for (const [filename, targetSize] of Object.entries(sizes)) {
        console.log(`Resizing to ${targetSize}x${targetSize} for ${filename}...`);
        const resized = image.clone().resize(targetSize, targetSize, Jimp.RESIZE_BICUBIC);
        const outPath = path.join(publicDir, filename);
        await resized.writeAsync(outPath);
        
        // Save buffers for favicon.ico compilation
        if ([16, 32, 48].includes(targetSize)) {
            pngBuffers[targetSize] = await resized.getBufferAsync(Jimp.MIME_PNG);
        }
    }

    // Now package 16, 32, 48 PNGs into a single favicon.ico
    console.log('Packaging PNGs into favicon.ico...');
    const icoBuffer = createIco([
        pngBuffers[16],
        pngBuffers[32],
        pngBuffers[48]
    ], [16, 32, 48]);

    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('favicon.ico successfully generated!');

    // Clean up temporary PNGs
    fs.unlinkSync(path.join(publicDir, 'favicon-16.png'));
    fs.unlinkSync(path.join(publicDir, 'favicon-32.png'));
    fs.unlinkSync(path.join(publicDir, 'favicon-48.png'));
    console.log('Temporary sizes cleaned up.');
    console.log('Favicon generation completed successfully!');
}

function createIco(pngBuffers, sizes) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngBuffers.length, 4);

    const directories = [];
    let currentOffset = 6 + 16 * pngBuffers.length;

    for (let i = 0; i < pngBuffers.length; i++) {
        const size = sizes[i];
        const buffer = pngBuffers[i];
        
        const dir = Buffer.alloc(16);
        dir.writeUInt8(size === 256 ? 0 : size, 0);
        dir.writeUInt8(size === 256 ? 0 : size, 1);
        dir.writeUInt8(0, 2);
        dir.writeUInt8(0, 3);
        dir.writeUInt16LE(1, 4);
        dir.writeUInt16LE(32, 6);
        dir.writeUInt32LE(buffer.length, 8);
        dir.writeUInt32LE(currentOffset, 12);

        directories.push(dir);
        currentOffset += buffer.length;
    }

    return Buffer.concat([header, ...directories, ...pngBuffers]);
}

generate().catch(err => {
    console.error('Error generating favicons:', err);
    process.exit(1);
});
