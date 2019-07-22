import Chars from '../char/Chars';
import { CharPixels } from '../types';
import pixelIndex from '../pixels/pixelIndex';
import Settings from '../Settings';

export default class {
  private c: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly image: HTMLImageElement;
  private readonly width: number;
  private readonly height: number;
  public pixels: ImageData;
  private settings: Settings;

  constructor(settings: Settings, c: HTMLCanvasElement, image: HTMLImageElement) {
    this.settings = settings;
    this.c = c;
    this.ctx = c.getContext('2d');
    this.image = image;
    this.width = this.c.width;
    this.height = this.c.height;
  }

  createChunks(characters: CharPixels) {
    // TODO: When migrating to video, try to save all the chunks at the start of the video and use:
    // chunks.forEach(chunk => {
    //     chunk.forEach(pixel => { // <- now you read indices
    //         image.data[pixel] // <- and colors
    //     });
    // });
    // TODO: Before each frame.
    const { microWidth: CW, microHeight: CH, resolution } = this.settings;
    let text = '';
    console.time('Gather chunks');
    for (let ch = 1; ch + CH < this.height; ch += CH * resolution) {
      let lineText = '';
      for (let cw = 1; cw < this.width; cw += CW * resolution) {
        // Chunk
        const chars = new Chars(this.settings, characters);
        for (let y = ch; y < ch + CH; y++) {
          for (let x = cw; x < cw + CW; x++) {
            const pixel = pixelIndex(this.width, x, y);
            const white = this.pixels.data[pixel];
            chars.compareChars(x - cw + 1, y - ch + 1, white);
          }
        }
        lineText += Object.entries(chars.charSums).sort(([, a], [, b]) => a - b)[0][0];
      }
      text += lineText + '\n';
    }
    console.timeEnd('Gather chunks');
    const canvas = document.createElement('canvas');
    canvas.getContext('2d').putImageData(this.pixels, 0, 0);
    document.body.appendChild(canvas);
    document.querySelector('pre').innerText = text;
  }

  draw() {
    this.ctx.drawImage(this.image, 0, 0);
  }

  updateCanvas(data: ImageData) {
    this.ctx.putImageData(data, 0, 0);
  }

  grayscale() {
    const { data } = this.pixels;
    for (let i = 0; i < data.length; i += 4) {
      const luma = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;

      data[i] = data[i + 1] = data[i + 2] = luma;
      data[i + 3] = data[i + 3];
    }
  }

  updateData() {
    this.data = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  set data(pixels: ImageData) {
    this.pixels = pixels;
  }
}
