const faker = require('faker');

module.exports = class StreamData {
  constructor() {
    this.didWorkersFinish = false;
  }

  *stream() {
    let count = 0;

    while (!this.didWorkersFinish) {
      count++;

      if (count % 1 << 0 === 0) {
        let length = 9;
        let left = (Math.random() * 10) << 0;
        let right = length - left;
        const wordArray = [];

        while (left > 0) {
          wordArray.push(faker.lorem.word());
          left--;
        }

        wordArray.push('FiCo');

        while (right > 0) {
          wordArray.push(faker.lorem.word());
          right--;
        }

        yield wordArray.join(' ');
      } else yield faker.lorem.words(10);
    }
  }

  data() {
    let length = 9;
    let left = (Math.random() * 10) << 0;
    let right = length - left;
    const wordArray = [];

    while (left > 0) {
      wordArray.push(faker.lorem.word());
      left--;
    }

    wordArray.push('FiCo');

    while (right > 0) {
      wordArray.push(faker.lorem.word());
      right--;
    }
    return wordArray.join(' ');
  }

  stop() {
    this.didWorkersFinish = true;
  }
};