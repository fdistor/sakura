const { parentPort } = require('worker_threads');

const countBytes = string => {
  return encodeURI(string).split(/%..|./).length - 1;
};

const kmp = text => {
  const patternTable = [0, 0, 0, 0];
  const word = 'FiCo';
  let textIndex = 0;
  let wordIndex = 0;

  while (textIndex < text.length) {
    if (text[textIndex] === word[wordIndex]) {
      if (wordIndex === word.length - 1) {
        return textIndex - word.length + 1;
      }

      wordIndex += 1;
      textIndex += 1;
    } else if (wordIndex > 0) {
      wordIndex = patternTable[wordIndex - 1];
    } else {
      wordIndex = 0;
      textIndex += 1;
    }
  }

  return -1;
};

parentPort.on('message', message => {
  const result = {};
  const search = kmp(message.chunk);
  let bytes = 0;

  if (search === -1) {
    result.didFind = false;
    bytes = countBytes(message.chunk);
  } else {
    result.didFind = true;
    bytes = countBytes(message.chunk.slice(0, search + 4));
  }

  result.id = message.id;
  result.bytes = bytes;

  parentPort.postMessage(result);
});
