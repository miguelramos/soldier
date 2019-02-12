import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ObservableMap } from './utils';
import { JobAttributes } from './typings';
import { Job, JobDescriptor } from './job';

export class Pipeline {
  private subject$ = new Subject();
  private pipes = new ObservableMap<string, Job>();

  async queue(key: string, worker: (job: Job, attrs: JobAttributes) => void) {
    return this.pipes.set(key, this.createJob(worker));
  }

  get(key: string) {
    return this.pipes.get(key);
  }

  dispatch(key: string, attrs?: JobAttributes) {
    const job = this.pipes.get(key);

    attrs = Object.assign(
      {},
      {
        delay: 0,
        disable: false,
        data: {},
        repeate: -1
      },
      attrs
    );

    if (job && attrs.disable !== true) {
      job.set(JobDescriptor.create('waiting', attrs.data, attrs));

      return job.schedule().pipe(
        tap(() => job.operation.call(job.operation, job, attrs)),
        takeUntil(this.subject$)
      );
    } else if (job) {
      return job.asObservable();
    }

    throw new Error(
      `Job: ${key} is not queued. Please assign to a queue first`
    );
  }

  queues() {
    return this.pipes.listener();
  }

  stop() {
    this.subject$.next(true);
  }

  private createJob(task: Function) {
    return new Job().task(task);
  }
}
