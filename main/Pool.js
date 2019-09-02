const { Worker, parentPort } = require('worker_threads');

module.exports = class Pool {
  constructor(size, workerPath, timeout) {
    this.workers = new Map();
    this.workerPath = workerPath;
    this.timeout = timeout || 60000; // default to 60s
    this.workingWorkers = size;
    this.start = null;

    this.addWorkers(size);
  }

  addWorkers(size) {
    while (size) {
      const worker = new Worker(this.workerPath);
      this.workers.set(worker.threadId, {
        worker,
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

  stopWorker(id) {
    const elapsed = Date.now() - this.start;
    const workerInfo = this.getWorker(id);

    workerInfo.elapsed = elapsed;
    workerInfo.status = 'STOPPED';

    this.workers.set(id, workerInfo);
    worker.terminate();
  }

  work(array) {
    this.workers.forEach(({ worker }, i) => {
      worker.postMessage(array[i]);

      worker.on('message', result => {
        if (result === 'FiCo') this.stopWorker(worker.threadId);
      });
      worker.on('error', console.log('error'));
      worker.on('exit', code => {
        if (code !== 0) this.stopWorker(worker.threadId);
      });
    });
  }

  countBytes(string) {
    return encodeURI(string).split(/%..|./).length - 1;
  }
};
