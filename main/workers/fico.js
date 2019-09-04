const { parentPort } = require('worker_threads');

parentPort.on('message', message => {
  if (message === 'FiCo') {
    parentPort.postMessage('found');
  } else {
    parentPort.postMessage('not found');
  }
});
