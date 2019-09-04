const { Worker } = require('worker_threads');

module.exports = class Wrapper {
	constructor(workerPath) {
		this.worker = new Worker(workerPath);
		this.resolve = null;
		this.reject = null;

		this.worker.on('message', result => {
			this.resolve(result);
		});
		this.worker.on('error', () => console.log('error'));
		this.worker.on('exit', code => {
			if (code !== 0) this.reject(code);
		});
	}

	addResolve(resolve) {
		this.resolve = resolve;
	}

	addReject(reject) {
		this.reject = reject;
	}

	removeResolve() {
		this.resolve = null;
	}

	removeReject() {
		this.reject = null;
	}
};
