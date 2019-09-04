const Wrapper = require('./Wrapper.js');

module.exports = class Pool {
	constructor(size, workerPath, timeout) {
		this.workers = new Map();
		this.workerPath = workerPath;
		this.timeout = timeout || 60000; // default to 60s
		this.workersInProgress = size;
		this.startTime = null;
		this.stopTime = null;
		this.finished = [];

		this.addWorkers(size);
	}

	addWorkers(size) {
		while (size) {
			const wrapper = new Wrapper(this.workerPath);

			this.workers.set(wrapper.worker.threadId, {
				wrapper,
				read: 0,
				elapsed: 0,
				status: 'WORKING'
			});
			size--;
		}
	}

	getWorker(id) {
		return this.workers.get(id);
	}

	stopWorker(worker) {
		worker.elapsed = Date.now() - this.startTime;
		worker.status = 'STOPPED';

		worker.wrapper.worker.terminate();

		this.finished.push(worker);
		this.workersInProgress--;
	}

	work(array) {
		return new Promise(async (parentResolve, parentReject) => {
			try {
				const workers = this.workers.values();
				const results = await Promise.all(
					array.map(
						(chunk, i) =>
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
			if (data) {
				const { didFind, id, bytes } = data;
				const worker = this.getWorker(id);

				this.updateBytesReadOfWorker(bytes, worker);

				if (didFind) {
					this.stopWorker(worker);
				}
			}
		});
	}

	updateBytesReadOfWorker(bytes, worker) {
		worker.read += bytes;
	}

	startTimer() {
		this.startTime = Date.now();
	}

	stopTimer() {
		this.stopTime = Date.now();
	}
};
