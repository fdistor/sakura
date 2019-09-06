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
    this.averageBytesPerMs = null;
    this.logToStdout = [];
    this.longestByteLength = 0;
    this.longestTimeLength = 0;
    this.longestStatusLength = 0;

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
    worker.status = 'SUCCESS';

    worker.wrapper.worker.terminate();

    this.successful.push(worker);
    this.workersInProgress--;
  }

  stopWorkerOnError(id, error) {
    const worker = this.getWorker(id);

    worker.status = 'FAILURE';
    worker.error = error;

    worker.wrapper.worker.terminate();

    this.erroredOut.push(worker);
    this.workersInProgress--;
  }

  stopAllWorkersOnTimeout() {
    this.workers.forEach(worker => {
      if (worker.status === 'WORKING') {
        worker.status = 'TIMEOUT';

        worker.wrapper.worker.terminate();

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

  getAverageBytesPerMillisecond() {
    this.successful.forEach(worker => {
      const { read, elapsed } = worker;

      this.totalBytesRead += read;
      this.totalTimeElapsed += elapsed;
    });

    this.averageBytesPerMs = Math.floor(
      this.totalBytesRead / this.totalTimeElapsed
    );
  }

  findLongestString(ref, array, property) {
    array.forEach(worker => {
      const value = worker[property];
      const valueLength = String(value).length;

      this[ref] = Math.max(valueLength, this[ref]);
    });
  }

  formatSuccessfulWorkerInfo() {
    this.successful.forEach(worker => {
      const { read, elapsed, status } = worker;

      worker.read = this.padSpaces(read, this.longestByteLength);
      worker.elapsed = this.padSpaces(elapsed, this.longestTimeLength);
      worker.status = this.padSpaces(status, this.longestStatusLength);
    });
  }

  formatUnsuccessfulWorkerInfo(array) {
    array.forEach(worker => {
      const { status } = worker;

      worker.read = this.padSpaces('', this.longestByteLength);
      worker.elapsed = this.padSpaces('', this.longestTimeLength);
      worker.status = this.padSpaces(status, this.longestStatusLength);
    });
  }

  pushSuccessfulToStdout() {
    for (let i = this.successful.length - 1; i >= 0; i--) {
      const { read, elapsed, status } = this.successful[i];
      const result = `${elapsed} ${read} ${status}`;

      this.logToStdout.push(result);
    }
  }

  pushUnsuccessfulToStdout(array) {
    array.forEach(({ read, elapsed, status }) => {
      const result = `${read} ${elapsed} ${status}`;

      this.logToStdout.push(result);
    });
  }

  pushAverageBPMsToStdout() {
    const result = `Avg B/ms ${this.averageBytesPerMs}`;

    this.logToStdout.push(result);
  }

  padSpaces(input, maxLength) {
    let result = String(input);

    while (result.length < maxLength) {
      result = result + ' ';
    }

    return result;
  }

  printToStdout() {
    this.getAverageBytesPerMillisecond();

    this.findLongestString('longestByteLength', this.successful, 'read');
    this.findLongestString('longestStatusLength', this.workers, 'status');
    this.findLongestString('longestTimeLength', this.successful, 'elapsed');

    this.formatSuccessfulWorkerInfo();
    this.pushSuccessfulToStdout();

    this.formatUnsuccessfulWorkerInfo(this.erroredOut);
    this.formatUnsuccessfulWorkerInfo(this.timedOut);
    this.pushUnsuccessfulToStdout(this.erroredOut);
    this.pushUnsuccessfulToStdout(this.timedOut);

    this.pushAverageBPMsToStdout();

    const result = this.logToStdout.join('\n');

    console.log(result);
  }

  printToStderr() {
    this.erroredOut.forEach(worker => {
      const message = `Thread ${worker.id} exited with error ${worker.error}`;

      console.error(message);
    });
  }
};
