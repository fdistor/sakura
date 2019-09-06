#!/usr/bin/env node --experimental-worker

const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./classes/Pool.js');
const Data = require('./data/Data.js');

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
  const arg = process.argv.slice(2)[0];

  if (arg === '-h') {
    console.log(
      'To start the program, run `sakura [timeout]` where [timeout] is an integer in milliseconds that determines how long the program will run.\n No integer input will default to 60000ms.'
    );
  } else run(arg);
};

execute();
