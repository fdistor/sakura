const { Worker, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const filePath = __dirname + '/../../data/data.txt';

const data = workerData;

const search = options => {
	options.encoding = 'utf8';
	const stream = fs.createReadStream(filePath, options);

	stream.on('data', data => console.log(data));

	return options;
};

const result = search(data);

parentPort.postMessage(result);
