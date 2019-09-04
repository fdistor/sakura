const Wrapper = require('./Wrapper.js');

module.exports = class Pool {
  constructor(size, workerPath, timeout) {
    this.workers = new Map();
    this.workerPath = workerPath;
    this.timeout = timeout || 60000; // default to 60s
    this.workingWorkers = size;
    this.start = null;
    this.wrappedWorker = new Wrapper(workerPath);
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

  stopWorker(id) {
    const elapsed = Date.now() - this.start;
    const workerInfo = this.getWorker(id);

    workerInfo.elapsed = elapsed;
    workerInfo.status = 'STOPPED';

    this.workers.set(id, workerInfo);
    worker.terminate();
  }

  work(array) {
    return new Promise(async (parentResolve, parentReject) => {
      try {
        const workers = [...this.workers];
        const results = await Promise.all(
          array.map(
            (chunk, i) =>
              new Promise((childResolve, childReject) => {
                const wrappedWorker = workers[i][1];
                wrappedWorker.wrapper.addResolve(childResolve);
                wrappedWorker.wrapper.addReject(childReject);
                wrappedWorker.wrapper.worker.postMessage(chunk);
              })
          )
        );

        parentResolve(results);
      } catch (err) {
        parentReject(err);
      }
    });
  }

  countBytes(string) {
    return encodeURI(string).split(/%..|./).length - 1;
  }
};
