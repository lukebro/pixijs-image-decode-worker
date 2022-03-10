export const createWorker = () => {
    let id = 0;
    const queue = new Map();

    const code = `(${internalCreateWorker.toString()})()`;
    const blob = new Blob([code.replace('"use strict";', '')]);
    const blobURL = URL.createObjectURL(blob, {
        type: 'application/javascript; charset=utf-8',
    });

    const worker = new Worker(blobURL);

    worker.onmessage = function (e) {
        const data = e.data;

        const item = queue.get(data.id);

        if (!item) {
            console.log('could not find id', id);
            return;
        }

        queue.delete(data.id);

        if (data.error) {
            return item.reject(data);
        }

        return item.resolve(data);
    };

    function internalCreateWorker() {
        function Resource(id, src) {
            this.onFinish = () => {};
            this.onError = () => {};
            this.src = src;
            this.id = id;
            this.xhr = undefined;
        }

        Resource.prototype.start = function () {
            this.xhr = new XMLHttpRequest();
            this.xhr.open('GET', this.src, true);
            this.xhr.responseType = 'blob';

            const me = this;

            this.xhr.onerror = function () {
                me.xhr.onError(new Error('http error'));
            };

            this.xhr.onload = function () {
                const blob = me.xhr.response;
                me.createImageBitmap(blob);
            };

            this.xhr.send();
        };

        Resource.prototype.createImageBitmap = function (blob) {
            const me = this;

            createImageBitmap(blob, {
                premultiplyAlpha: 'premultiply',
                colorSpaceConversion: 'none',
                imageOrientation: 'none',
            }).then(function (imageBitmap) {
                me.onFinish({
                    imageBitmap,
                });
            });
        };

        onmessage = function (e) {
            const { id, src } = e.data;
            const item = new Resource(id, src);

            item.onFinish = function ({ imageBitmap }) {
                postMessage({ id, src, imageBitmap });
            };

            item.onError = function () {
                postMessage({ id, src, error: true });
            };

            item.start();
        };
    }

    function getImageBitmap(src) {
        const nextId = id++;
        let resolve, reject;

        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

        queue.set(nextId, { id: nextId, src, resolve, reject });

        worker.postMessage({ id: nextId, src });

        return promise;
    }

    worker.getImageBitmap = getImageBitmap;

    return worker;
};
