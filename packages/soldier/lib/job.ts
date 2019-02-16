import { Subject, asyncScheduler, SchedulerAction, Subscription } from 'rxjs';

import { StatusDescriptor, JobAttributes } from './typings';
import { JobDescriptor } from './job-descriptor';

/*export function TaskNoopOperation() {
  _job: Job;
}

TaskNoopOperation.prototype.onInit = () => {};
TaskNoopOperation.prototype.onChange = () => {};
TaskNoopOperation.prototype.onFinish = () => {};*/

/**
 * Task assignment to function to run
 *
 * @export
 * @class Job
 * @extends {Subject<JobDescriptor>}
 */
export class Job extends Subject<JobDescriptor> {
  public descriptor: JobDescriptor = JobDescriptor.create('waiting', null);

  // private _hooks = ['onInit', 'onChange', 'onFinish'];
  // tslint:disable-next-line:ban-types
  public schedulerSubscription!: Subscription;

  private _args = [];

  // tslint:disable-next-line:no-empty
  public operation: (job: Job, attrs?: JobAttributes) => void = () => {};

  /**
   * Register task function to run
   *
   * @param {(job: Job, attrs?: JobAttributes) => void} fn
   * @param {...any} args
   * @returns
   * @memberof Job
   */
  public task(fn: (job: Job, attrs?: JobAttributes) => void, ...args: any): Job {
    if (typeof fn !== 'function') {
      throw new Error('Invalid type for task. Please use a function.');
    }

    this._args.concat(args);
    this.operation = fn;

    return this;
  }

  /**
   * Next trigger on observable
   *
   * @param {(JobDescriptor | any)} [value]
   * @memberof Job
   */
  public next(value?: JobDescriptor | any): void {
    if (value instanceof JobDescriptor) {
      this.set(value);
    } else {
      this.set('running', value);
    }

    super.next(this.get());
  }

  /**
   * Observable error trigger
   *
   * @param {(JobDescriptor | any)} erro
   * @memberof Job
   */
  public error(erro: JobDescriptor | any): void {
    if (erro instanceof JobDescriptor) {
      this.set(erro);
    } else {
      this.set('failed', erro);
    }

    super.error(this.get());
  }

  /**
   * Complete observable
   *
   * @memberof Job
   */
  public complete(): void {
    this.set('complete', this.descriptor.value, this.descriptor.details);
    super.complete();
  }

  /**
   * Get job descriptor
   *
   * @returns {JobDescriptor}
   * @memberof Job
   */
  public get(): JobDescriptor {
    return JobDescriptor.create(this.descriptor);
  }

  /**
   * Set job options
   *
   * @param {(JobDescriptor | StatusDescriptor)} descriptor
   * @param {*} [value]
   * @param {JobAttributes} [detail]
   * @memberof Job
   */
  public set(
    descriptor: JobDescriptor | StatusDescriptor,
    value?: any,
    detail?: JobAttributes
  ): void {
    this.descriptor.set(descriptor, value, detail);
  }

  /**
   * Schedule a job to run on an time interval
   *
   * @returns {Job}
   * @memberof Job
   */
  public schedule(): Job {
    const scheduler = asyncScheduler;

    const delay = this.descriptor.details.delay || 0;
    const self = this;

    this.schedulerSubscription = scheduler.schedule(
      function(this: SchedulerAction<Job>, state?: Job) {
        if (state) {
          state.next(self.descriptor.value);

          if (state.closed) {
            return;
          } else if (
            state.descriptor.details &&
            state.descriptor.details.repeatInterval === -1
          ) {
            return state.complete();
          }

          const period = state.descriptor.details.repeatInterval || -1;
          this.schedule(state, period);
        }
      },
      delay,
      self
    );

    return this;
  }
}
