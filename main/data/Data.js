const faker = require('faker');

module.exports = class Data {
  data() {
    const random = this.rng(5000);
    if (random === 0) {
      let length = 9;
      let left = this.rng(10);
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
    } else return faker.lorem.words(10);
  }

  rng(max) {
    return (Math.random() * max) << 0;
  }
};
