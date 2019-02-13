import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ObservableMap } from './utils';
import { JobAttributes } from './typings';
import { Job } from './job';
import { JobDescriptor } from './job-descriptor';

export class Pipeline {
  private subject$ = new Subject();
  private pipes = new ObservableMap<string, Job>();

  public async queue(
    key: string,
    worker: (job: Job, attrs?: JobAttributes) => void
  ) {
    return this.pipes.set(key, this.createJob(worker));
  }

  public get(key: string) {
    return this.pipes.get(key);
  }

  public dispatch(key: string, attrs?: JobAttributes) {
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

  public queues() {
    return this.pipes.listener();
  }

  public stop() {
    this.subject$.next(true);
  }

  private createJob(task: (job: Job, attrs?: JobAttributes) => void) {
    return new Job().task(task);
  }
}
