const { parentPort } = require('worker_threads');

const countBytes = string => {
  return encodeURI(string).split(/%..|./).length - 1;
};

parentPort.on('message', message => {
  const result = {};
  const bytes = countBytes(message.chunk);

  if (message.chunk === 'FiCo') {
    result.didFind = true;
  } else {
    result.didFind = false;
  }

  result.id = message.id;
  result.bytes = bytes;

  parentPort.postMessage(result);
});
