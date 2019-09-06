#!/usr/bin/env node --experimental-worker

const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./Pool.js');
const Data = require('../data/Data.js');
const inquirer = require('inquirer');

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

const question = [
  {
    type: 'input',
    name: 'timeout',
    message: 'Please input an integer (in ms) for the timeout value.',
    default: 60000
  }
];

const execute = () => {
  const args = process.argv.slice(2);
  if (args.length) {
    args.forEach(arg => {
      if (arg === '-h')
        console.log(
          'To start the program, at the root of the project, run `main/index.js` in the terminal and enter a number when prompted to set the timeout.'
        );
    });
  } else {
    inquirer.prompt(question).then(({ timeout }) => run(timeout));
  }
};

execute();
