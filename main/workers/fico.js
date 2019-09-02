const { parentPort } = require('worker_threads');

const compare = string => {
  return string === 'FiCo';
};

let result;

parentPort.on('message', data => {
  console.log(data);
  result = compare(data);
});

parentPort.postMessage(result);
