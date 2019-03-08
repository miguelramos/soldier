import { Subject, Observable } from 'rxjs';
import { takeUntil, tap, timeout, retry } from 'rxjs/operators';

import { Job } from './job';
import { JobAttributes } from './typings';
import { ObservableMap, isNumber } from './utils';
import { JobDescriptor } from './job-descriptor';

/**
 * Pipeline register and control jobs
 *
 * @export
 * @class Pipeline
 */
export class Pipeline {
  /**
   * Subject observable to perform actions
   * on pipeline and job.
   *
   * @private
   * @memberof Pipeline
   */
  private subject$ = new Subject();

  /**
   * Memory repo for jobs
   * 
   * TODO: Convert in adaptor to future integrations
   *
   * @private
   * @memberof Pipeline
   */
  private pipes = new ObservableMap<string, Job>();

  /**
   * Register and create job to run
   *
   * @param {string} key
   * @param {(job: Job, attrs?: JobAttributes) => void} worker
   * @returns {ObservableMap<string, Job>}
   * @memberof Pipeline
   */
  public queue(
    key: string,
    worker: (job: Job, attrs?: JobAttributes) => void
  ): ObservableMap<string, Job> {
    return this.pipes.set(key, this.createJob(worker));
  }

  /**
   * Get a registered job
   *
   * @param {string} key
   * @returns {(Job|undefined)}
   * @memberof Pipeline
   */
  public get(key: string): Job|undefined {
    return this.pipes.get(key);
  }

  /**
   * Dispatch a job to do is work
   *
   * @param {string} key
   * @param {JobAttributes} [attrs]
   * @returns {Observable<JobDescriptor>}
   * @memberof Pipeline
   */
  public dispatch(key: string, attrs?: JobAttributes): Observable<JobDescriptor> {
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

      if (isNumber(settings.repeatInterval as number) && (settings.repeatInterval as number) < 0) {
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

  /**
   * Get a Map of registered queues
   *
   * @returns {Subject<IterableIterator<[string, Job]>>}
   * @memberof Pipeline
   */
  public queues(): Subject<IterableIterator<[string, Job]>> {
    return this.pipes.listener();
  }

  /**
   * Stop queue to perform job
   *
   * @memberof Pipeline
   */
  public stop(): void {
    this.subject$.next(true);
  }

  /**
   * Creates a job
   *
   * @private
   * @param {(job: Job, attrs?: JobAttributes) => void} task
   * @returns {Job}
   * @memberof Pipeline
   */
  private createJob(task: (job: Job, attrs?: JobAttributes) => void): Job {
    return new Job().task(task);
  }
}
