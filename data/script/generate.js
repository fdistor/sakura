const fs = require('fs');
const faker = require('faker');

const writeStream = fs.createWriteStream(__dirname + '/../data.txt');

writeStream.on('drain', () => write());

let count = 1e6;

const write = async () => {
  while (count > 0) {
    const string = faker.lorem.paragraph(5);

    if (!writeStream.write(string)) return;
    count--;
  }

  writeStream.write('FiCo');
  writeStream.write(faker.lorem.paragraph(10));
  writeStream.end();
};

write().catch(() => console.error('Failed to write'));
