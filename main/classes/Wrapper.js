const { Worker } = require('worker_threads');

module.exports = class Wrapper {
	constructor(workerPath) {
		this.worker = new Worker(workerPath);
		this.resolve = null;
		this.reject = null;

		this.worker.on('message', result => {
			this.resolve(result);
			this.removeResolveAndReject();
		});
		this.worker.on('error', error => {
			const id = this.worker.threadId;
			this.reject({ error, id });
			this.removeResolveAndReject();
		});
	}

	addResolve(resolve) {
		this.resolve = resolve;
	}

	addReject(reject) {
		this.reject = reject;
	}

	removeResolveAndReject() {
		this.resolve = null;
		this.reject = null;
	}
};
