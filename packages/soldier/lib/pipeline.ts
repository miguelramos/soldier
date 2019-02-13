import { Subject } from 'rxjs';
import { takeUntil, tap, timeout, retry, defaultIfEmpty } from 'rxjs/operators';

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

    const settings: JobAttributes = Object.assign(
      {},
      {
        delay: 0,
        disable: false,
        data: {},
        repeatInterval: -1,
        retry: 0,
        timeout: 0
      },
      attrs
    );

    if (job && settings.disable !== true) {
      job.set(JobDescriptor.create('waiting', settings.data, settings));

      const observable = job.schedule().pipe(
        retry(settings.retry),
        tap(() => job.operation.call(job.operation, job, settings)),
        takeUntil(this.subject$)
      );

      if ((settings.repeatInterval as number) < 0) {
        observable.pipe(
          timeout((settings.timeout as number) + (settings.delay as number))
        );
      }

      return observable;
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
