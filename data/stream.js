const faker = require('faker');

function* wordGenerator() {
  while (true) {
    yield faker.lorem.sentence(3, 5);
  }
}

const counterIterator = wordGenerator();

const logIterator = iterator => {
  for (const item of iterator) {
    console.log('writing:', item);
  }
};

logIterator(counterIterator);
