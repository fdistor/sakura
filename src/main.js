const { Worker, parentPort, workerData } = require('worker_threads');
const fs = require('fs');

const searchFiCo = filePath => {
	new Promise((resolve, reject) => {
		const fileSize = fs.statSync(filePath).size;

		const worker = new Worker('./workers/search.js', {
			workerData: script
		});

		worker.on('message', resolve);
		worker.on('error', reject);
		worker.on('exit', code => {
			if (code !== 0)
				reject(new Error(`Worker stopped with exit code ${code}`));
		});
	});
};

searchFiCo(__dirname + '/../data/data.txt');
