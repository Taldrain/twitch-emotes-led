import sharp from 'sharp';

export function transformImg(img: Buffer): Promise<Buffer> {
  return sharp(img)
    .flatten()
    .resize({ width: 32, height: 32, fit: 'fill' })
    .sharpen()
    .raw()
    .toBuffer();
}
