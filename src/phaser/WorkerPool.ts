export class WorkerPool {
    private workers: { worker: Worker; busy: boolean; callback?: (result: any)=> void }[];
    private taskQueue: { data: any; callback: (result: any)=> void }[];

    constructor(workerScript: string, numberOfWorkers?: number) {
        this.workers = [];
        this.taskQueue = [];

        // Use navigator.hardwareConcurrency to get the number of CPU cores
        // const cores = navigator.hardwareConcurrency || 4; // Fallback to 4 if hardwareConcurrency is not available
        // TODO: need to test performance based on number of cores
        const cores = 2; // Use a conservative default for testing
        const effectiveNumberOfWorkers = numberOfWorkers ? Math.min(numberOfWorkers, cores) : cores;

        for (let i = 0; i < effectiveNumberOfWorkers; i++) {
            const worker = new Worker(workerScript);
            worker.onmessage = (e) => this.onWorkerMessage(e, worker);
            this.workers.push({ worker, busy: false });
        }
    }

    private onWorkerMessage(e: MessageEvent, worker: Worker) {
        const workerInfo = this.workers.find((w) => w.worker === worker);
        if (workerInfo && workerInfo.callback) {
            workerInfo.callback(e.data);

            // Clear the callback after invocation to prevent it from being called again unintentionally
            workerInfo.callback = undefined;

            // Mark the worker as not busy
            this.markWorkerAsIdle(worker);
            // Check if there are any queued tasks to process
            this.processNextTaskIfNeeded();
        }
    }

    private markWorkerAsIdle(worker: Worker) {
        const workerInfo = this.workers.find((w) => w.worker === worker);
        if (workerInfo) {
            workerInfo.busy = false;
        }
    }

    private processNextTaskIfNeeded() {
        const workerInfo = this.workers.find((w) => !w.busy);
        if (workerInfo && this.taskQueue.length > 0) {
            const { data, callback } = this.taskQueue.shift()!;
            workerInfo.busy = true;
            workerInfo.callback = callback; // Associate the current task's callback with this worker
            workerInfo.worker.postMessage(data);
        }
    }

    public addTask(taskData: any, callback: (result: any)=> void) {
        const idleWorkerInfo = this.workers.find((w) => !w.busy);
        if (idleWorkerInfo) {
            idleWorkerInfo.busy = true;
            idleWorkerInfo.callback = callback; // Store the callback for this task
            idleWorkerInfo.worker.postMessage(taskData);
        } else {
            // If all workers are busy, queue the task
            this.taskQueue.push({ data: taskData, callback });
        }
    }

    // Optional: Method to terminate all workers when done
    public terminateAllWorkers() {
        for (const workerInfo of this.workers) {
            workerInfo.worker.terminate();
        }
        this.workers = [];
        this.taskQueue = [];
    }
}