const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./Pool.js');
const Data = require('../data/Data.js');

const searchFiCo = () => {
  return new Promise(async (parentResolve, parentReject) => {
    const start = Date.now();
    const pool = new Pool(10, workerPath, null);
    const stream = new Data().stream();

    const iterator = generator => {
      for (const item of generator) {
        const words = item.split(' ');
        // const load = Math.ceil(words.length / workerCount);

        pool.work(words);
      }
    };

    iterator(stream);
  });
};

searchFiCo();
