const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./Pool.js');
const Data = require('../data/Data.js');

const run = async () => {
  const start = Date.now();
  const pool = new Pool(10, workerPath, null);
  const stream = new Data();
  let count = 10;

  // console.log(pool.workers);

  while (count) {
    console.log(count, 'index.js');
    const data = stream.data();
    const array = data.split(' ');
    const result = await pool.work(array);
    console.log(result, 'index.js');
    count--;
  }
};

run()
  .catch(err => console.error(err))
  .then(() => console.log('done'));
