import { ObservableMap } from './utils';
import { Job, JobDescriptor } from './job';
import { JobAttributes } from './typings';
import { takeUntil, delay, tap, defaultIfEmpty } from 'rxjs/operators';
import { Subject } from 'rxjs';

export class Pipeline {
  private subject$ = new Subject();
  private pipes = new ObservableMap<string, Job>();

  async queue(key: string, worker: Function) {
    return this.pipes.set(key, this.createJob(worker));
  }

  async dispatch(
    key: string,
    attrs: JobAttributes = {
      delay: 0,
      disable: false,
      data: {},
      repeate: 0
    }
  ) {
    const job = this.pipes.get(key);

    if (job) {
      job
        .pipe(
          attrs.delay && attrs.delay > 0
            ? delay(attrs.delay)
            : defaultIfEmpty(job.descriptor),
          tap(() => job.operation.call(job.operation, job, attrs)),
          takeUntil(this.subject$)
        )
        .subscribe();

      job.next(JobDescriptor.create('running', attrs.data, attrs));
    }
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
