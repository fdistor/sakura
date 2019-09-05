const Wrapper = require('./Wrapper.js');

module.exports = class Pool {
	constructor(size, workerPath, timeout) {
		this.workers = new Map();
		this.workerPath = workerPath;
		this.timeout = timeout || 60000; // default to 60s
		this.workersInProgress = size;
		this.startTime = null;
		this.timeoutTime = null;
		this.stopTime = null;
		this.successful = [];
		this.timedOut = [];
		this.erroredOut = [];
		this.totalBytesRead = 0;
		this.totalTimeElapsed = 0;
		this.averageBytesPerNanosecond = null;

		this.addWorkers(size);
	}

	addWorkers(size) {
		while (size) {
			const wrapper = new Wrapper(this.workerPath);
			const id = wrapper.worker.threadId;

			this.workers.set(id, {
				id,
				wrapper,
				read: 0,
				elapsed: 0,
				status: 'WORKING',
				error: null
			});
			size--;
		}
	}

	getWorker(id) {
		return this.workers.get(id);
	}

	stopWorkerOnSuccess(worker) {
		worker.elapsed = Date.now() - this.startTime;
		worker.status = 'STOPPED';

		worker.wrapper.worker.terminate();

		this.successful.push(worker);
		this.workersInProgress--;
	}

	stopWorkerOnError(id, error) {
		const worker = this.getWorker(id);

		worker.elapsed = Date.now() - this.startTime;
		worker.status = 'FAILURE';
		worker.error = error;

		this.erroredOut.push(worker);
		this.workersInProgress--;
	}

	stopAllWorkersOnTimeout() {
		this.workers.forEach(worker => {
			if (worker.status === 'WORKING') {
				worker.status = 'TIMEOUT';
				this.timedOut.push(worker);
			}
		});
	}

	work(array) {
		return new Promise(async (parentResolve, parentReject) => {
			try {
				const workers = this.workers.values();
				const results = await Promise.all(
					array.map(
						chunk =>
							new Promise((childResolve, childReject) => {
								const { wrapper, status } = workers.next().value;

								if (status === 'WORKING') {
									wrapper.addResolve(childResolve);
									wrapper.addReject(childReject);
									wrapper.worker.postMessage({
										chunk,
										id: wrapper.worker.threadId
									});
								} else {
									childResolve(null);
								}
							})
					)
				);

				parentResolve(results);
			} catch (err) {
				parentReject(err);
			}
		});
	}

	updateWorkerInfo(array) {
		array.forEach(data => {
			if (data && data.error) {
				const { id, error } = data;

				this.stopWorkerOnError(id, error);
			} else if (data) {
				const { didFind, id, bytes } = data;
				const worker = this.getWorker(id);

				this.updateBytesReadOfWorker(bytes, worker);

				if (didFind) {
					this.stopWorkerOnSuccess(worker);
				}
			}
		});
	}

	updateBytesReadOfWorker(bytes, worker) {
		worker.read += bytes;
	}

	startTimer() {
		this.startTime = Date.now();
		this.timeoutTime = this.startTime + this.timeout;
	}

	stopTimer() {
		this.stopTime = Date.now();
	}

	getAverageBytesPerNanosecond() {
		this.successful.forEach(worker => {
			const { read, elapsed } = worker;

			this.totalBytesRead += read;
			this.totalTimeElapsed += elapsed;
		});

		this.averageBytesPerNanosecond = Math.floor(
			this.totalBytesRead / this.totalTimeElapsed
		);
	}
};
