import { Subject, asyncScheduler, SchedulerAction, Subscription } from 'rxjs';

import { StatusDescriptor, JobAttributes } from './typings';
import { JobDescriptor } from './job-descriptor';

/*export function TaskNoopOperation() {
  _job: Job;
}

TaskNoopOperation.prototype.onInit = () => {};
TaskNoopOperation.prototype.onChange = () => {};
TaskNoopOperation.prototype.onFinish = () => {};*/

export class Job extends Subject<JobDescriptor> {
  public descriptor: JobDescriptor = JobDescriptor.create('waiting', null);

  // private _hooks = ['onInit', 'onChange', 'onFinish'];
  // tslint:disable-next-line:ban-types
  public schedulerSubscription!: Subscription;

  private _args = [];

  // tslint:disable-next-line:no-empty
  public operation: (job: Job, attrs?: JobAttributes) => void = () => {};

  public task(fn: (job: Job, attrs?: JobAttributes) => void, ...args: any) {
    if (typeof fn !== 'function') {
      throw new Error('Invalid type for task. Please use a function.');
    }

    this._args.concat(args);
    this.operation = fn;

    return this;
  }

  public next(value?: JobDescriptor | any) {
    if (value instanceof JobDescriptor) {
      this.set(value);
    } else {
      this.set('running', value);
    }

    super.next(this.get());
  }

  public error(erro: JobDescriptor | any) {
    if (erro instanceof JobDescriptor) {
      this.set(erro);
    } else {
      this.set('failed', erro);
    }

    super.error(this.get());
  }

  public complete() {
    this.set('complete', this.descriptor.value, this.descriptor.details);
    super.complete();
  }

  public get() {
    return JobDescriptor.create(this.descriptor);
  }

  public set(
    descriptor: JobDescriptor | StatusDescriptor,
    value?: any,
    detail?: any
  ) {
    this.descriptor.set(descriptor, value, detail);
  }

  public schedule() {
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
            state.descriptor.details.repeate === -1
          ) {
            return state.complete();
          }

          const period = state.descriptor.details.repeate || -1;
          this.schedule(state, period);
        }
      },
      delay,
      self
    );

    return this;
  }
}
