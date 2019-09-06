const faker = require('faker');

module.exports = class Data {
  data() {
    const random = this.rng(20000);

    if (random === 0) {
      let left = this.rng(1000);
      let right = 100 - left;
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

      return wordArray.join('');
    } else return faker.lorem.paragraph(this.rng(100));
  }

  rng(max) {
    return (Math.random() * max) << 0;
  }
};
