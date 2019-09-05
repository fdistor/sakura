const workerPath = __dirname + '/workers/fico.js';
const Pool = require('./Pool.js');
const Data = require('../data/Data.js');

const run = async () => {
	const pool = new Pool(10, workerPath, null);
	const stream = new Data();

	pool.startTimer();

	while (pool.workersInProgress && Date.now() < pool.timeoutTime) {
		const data = stream.data();
		const array = data.split(' ');
		const result = await pool.work(array);

		pool.updateWorkerInfo(result);
	}

	pool.stopTimer();
	pool.stopAllWorkersOnTimeout();
	pool.getAverageBytesPerNanosecond();

	console.log(
		'FINISHED: ',
		pool.successful,
		'\n\n\nTIMEDOUT: ',
		pool.timedOut,
		pool.stopTime - pool.startTime,
		pool.averageBytesPerNanosecond
	);
};

run()
	.catch(err => console.error(err))
	.then(() => console.log('done'));
