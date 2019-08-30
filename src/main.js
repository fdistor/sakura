const { Worker } = require('worker_threads');
const fs = require('fs');
const workerPath = __dirname + '/workers/search.js';
const filePath = __dirname + '/../data/data.txt';

const searchFiCo = filePath => {
  return new Promise(async (parentResolve, parentReject) => {
    const fileSize = fs.statSync(filePath).size;
    const workerChunk = Math.ceil(fileSize / 10);

    const chunks = Array.from(new Array(10), (el, i) => i);

    try {
      const results = await Promise.all(
        chunks.map(
          chunk =>
            new Promise((resolve, reject) => {
              const start = chunk * workerChunk;
              const end = start + workerChunk - 1;
              const worker = new Worker(workerPath, {
                workerData: { start, end }
              });

              worker.on('message', resolve);
              worker.on('error', reject);
              worker.on('exit', code => {
                if (code !== 0)
                  reject(new Error(`Worker stopped with exit code ${code}`));
              });
            })
        )
      );

      parentResolve(results);
    } catch (err) {
      parentReject(err);
    }
  });
};

searchFiCo(filePath).then(result => console.log(result));
