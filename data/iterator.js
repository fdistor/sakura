const logIterator = iterator => {
  for (const item of iterator) {
    console.log('writing:', item);
  }
};

module.exports = {
  logIterator
};
