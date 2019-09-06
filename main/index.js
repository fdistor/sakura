#!/usr/bin/env node --experimental-worker

const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./Pool.js');
const Data = require('../data/Data.js');

const run = async timeout => {
  if (isNaN(Number(timeout))) timeout = 60000;
  else timeout = Number(timeout);

  const pool = new Pool(10, workerPath, timeout);
  const stream = new Data();

  pool.startTimer();

  while (pool.workersInProgress && Date.now() < pool.timeoutTime) {
    const data = stream.data();
    const array = data.split(' ');
    const result = await pool.work(array);

    pool.updateWorkerInfo(result);
  }

  pool.stopTimer();
  pool.stopAllWorkersOnTimeout();

  pool.printToStdout();
  pool.printToStderr();
};

const execute = () => {
  const args = process.argv.slice(2);
  if (args.length) {
    args.forEach(arg => {
      if (arg === '-h')
        console.log(
          'To start the program, at the root of the project, run `main/index.js` in the terminal and enter a number when prompted to set the timeout.'
        );
      else run(arg);
    });
  } else {
    run(60000);
  }
};

execute();
