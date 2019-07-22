import Image from './image/Image';
import Chars from './char/Chars';
import Settings from './Settings';

const canvas: HTMLCanvasElement = document.querySelector('canvas.main-canvas');
const img: HTMLImageElement = document.querySelector('img');

const settings = new Settings();

const image = new Image(settings, canvas, img);

window.onload = () => {

  const chars = new Chars(settings);
  chars.allChars();

  image.draw();
  image.updateData();
  console.log(image.createChunks(chars.charPixels));
};
