import './style.css';
import Stats from 'stats.js';
import {
  Application,
  Container,
  Sprite,
  Texture,
  BaseTexture,
  ImageBitmapResource,
} from 'pixi.js';
import { createWorker } from './worker';

let useWorker = window.localStorage.getItem('useWorker') === 'true';

const input = document.querySelector('#worker');
input.checked = useWorker;

input.addEventListener('change', () => {
  useWorker = !useWorker;
  window.localStorage.setItem('useWorker', useWorker);
  window.location.reload();
});

const stats = new Stats();
stats.showPanel(0);
stats.dom.classList.add('fps');
document.body.appendChild(stats.dom);

const app = new Application({
  resizeTo: window,
});

app.renderer.on('prerender', () => {
  stats.begin();
});

app.renderer.on('postrender', () => {
  stats.end();
});

document.body.appendChild(app.view);
const container = new Container();
app.stage.addChild(container);
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

app.ticker.add((delta) => {
  container.rotation -= 0.01 * delta;
});

if (useWorker) {
  console.log('Decoding using web worker...');
  createUsingWorker();
} else {
  console.log('Decoding using main thread...');
  createUsingMain();
}

function createUsingWorker() {
  const worker = createWorker();

  worker
    .getImageBitmap('https://source.unsplash.com/random/5000x5000')
    .then(({ imageBitmap }) => {
      const resource = new ImageBitmapResource(imageBitmap);
      const baseTexture = new BaseTexture(resource);

      const texture = Texture.from(baseTexture);

      for (let i = 0; i < 10000; i++) {
        const bunny = new Sprite(texture);
        bunny.width = 100;
        bunny.height = 100;
        bunny.anchor.set(0.5);
        bunny.x = (i % 100) * 100;
        bunny.y = Math.floor(i / 100) * 100;
        container.addChild(bunny);
      }

      container.pivot.x = container.width / 2;
      container.pivot.y = container.height / 2;
    });
}

function createUsingMain() {
  const texture = Texture.from('https://source.unsplash.com/random/5000x5000');
  for (let i = 0; i < 10000; i++) {
    const bunny = new Sprite(texture);
    bunny.width = 100;
    bunny.height = 100;
    bunny.anchor.set(0.5);
    bunny.x = (i % 100) * 100;
    bunny.y = Math.floor(i / 100) * 100;
    container.addChild(bunny);
  }
  // Center bunny sprite in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
}
