// Bounded concurrent fetch queue - replaces promise chain pattern
// Prevents memory leaks from unbounded .then() chaining

export class FetchQueue {
  constructor(maxConcurrent = 3) {
    this.max = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async enqueue(fn) {
    while (this.running >= this.max) {
      await new Promise(r => this.queue.push(r));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
