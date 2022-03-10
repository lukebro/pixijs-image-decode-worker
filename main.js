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

const stats = new Stats();
stats.showPanel(0);
stats.dom.classList.add('fps');
document.body.appendChild(stats.dom);

const worker = createWorker();

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

// Create a 5x5 grid of bunnies
// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// worker
//     .getImageBitmap('https://source.unsplash.com/random/5000x5000')
//     .then(({ imageBitmap }) => {
//         const resource = new ImageBitmapResource(imageBitmap);
//         const baseTexture = new BaseTexture(resource);

//         const texture = Texture.from(baseTexture);

//         for (let i = 0; i < 10000; i++) {
//             const bunny = new Sprite(texture);
//             bunny.width = 100;
//             bunny.height = 100;
//             bunny.anchor.set(0.5);
//             bunny.x = (i % 100) * 100;
//             bunny.y = Math.floor(i / 100) * 100;
//             container.addChild(bunny);
//         }

//         container.pivot.x = container.width / 2;
//         container.pivot.y = container.height / 2;
//     });

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

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});
