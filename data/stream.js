const faker = require('faker');

function* stream() {
  let count = 0;

  while (true) {
    count++;

    if (count % 1e4 << 0 === 0) {
      let length = 9;
      const left = (Math.random() * length) << 0;
      const right = length - left;
      yield faker.lorem.words(left) + ' FiCo ' + faker.lorem.words(right);
    } else yield faker.lorem.words(10);
  }
}

// const counterIterator = stream();

// const logIterator = iterator => {
//   for (const item of iterator) {
//     console.log('writing:', item);
//   }
// };

// logIterator(counterIterator);

module.exports = {
  stream
};
