const Wrapper = require('./Wrapper.js');

module.exports = class Pool {
  constructor(size, workerPath, timeout) {
    this.workers = new Map();
    this.workerPath = workerPath;
    this.timeout = timeout || 60000; // default to 60s
    this.workingWorkers = size;
    this.start = null;
    this.wrappedWorker = new Wrapper(workerPath);

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

  stopWorker(id) {
    const elapsed = Date.now() - this.start;
    const workerInfo = this.getWorker(id);

    workerInfo.elapsed = elapsed;
    workerInfo.status = 'STOPPED';

    this.workers.set(id, workerInfo);
    worker.terminate();
  }

  work(array) {
    // this.worker.postMessage(array);
    // this.workers.forEach(({ worker }, i) => {
    //   worker.postMessage(array[i]);
    // });
  }

  doWork(array) {
    return new Promise((resolve, reject) => {
      this.wrappedWorker.addReject(reject);
      this.wrappedWorker.addResolve(resolve);
      this.wrappedWorker.worker.postMessage(array);
    });
  }

  countBytes(string) {
    return encodeURI(string).split(/%..|./).length - 1;
  }
};
