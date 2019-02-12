import {
  Subject,
  timer,
  Observable,
  Operator,
  SchedulerLike,
  asyncScheduler,
  SchedulerAction,
  Subscription
} from 'rxjs';

import { JobAttributes, StatusDescriptor } from './typings';

/**
 * Class to rule job internal data.
 *
 * @export
 * @class JobDescriptor
 */
export class JobDescriptor {
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  /**
   * Current job status
   *
   * @type {StatusDescriptor}
   * @memberof JobDescriptor
   */
  status: StatusDescriptor = 'waiting';

  /**
   * Current job data
   *
   * @type {*}
   * @memberof JobDescriptor
   */
  value: any = null;

  /**
   * Current job attributes
   *
   * @type {JobAttributes}
   * @memberof JobDescriptor
   */
  details: JobAttributes = {
    data: {},
    repeate: 0,
    delay: 0,
    disable: false
  };

  /**
   * Create a new instance of JobDescriptor
   *
   * @static
   * @param {(JobDescriptor | StatusDescriptor)} descriptor
   * @param {*} [value]
   * @param {JobAttributes} [detail]
   * @returns
   * @memberof JobDescriptor
   */
  static create(
    descriptor: JobDescriptor | StatusDescriptor,
    value?: any,
    detail?: JobAttributes
  ) {
    const jobDescriptor = new JobDescriptor();
    jobDescriptor.set(descriptor, value, detail);

    return jobDescriptor;
  }

  /**
   * Assigne jobdescriptor attributes, value and details
   *
   * @param {(JobDescriptor | StatusDescriptor)} descriptor
   * @param {*} [value]
   * @param {JobAttributes} [detail]
   * @memberof JobDescriptor
   */
  set(
    descriptor: JobDescriptor | StatusDescriptor,
    value?: any,
    detail?: JobAttributes
  ) {
    this.updatedAt = new Date();

    if (descriptor instanceof JobDescriptor) {
      this.status = descriptor.status;
      this.value = descriptor.value;
      this.details = descriptor.details;
    } else {
      this.status = descriptor;
      this.value = value;
      this.details = detail ? detail : this.details;
    }
  }
}

export function TaskNoopOperation() {
  _job: Job;
}

TaskNoopOperation.prototype.onInit = () => {};
TaskNoopOperation.prototype.onChange = () => {};
TaskNoopOperation.prototype.onFinish = () => {};

export class Job extends Subject<JobDescriptor> {
  descriptor: JobDescriptor = JobDescriptor.create('waiting', null);

  //private _hooks = ['onInit', 'onChange', 'onFinish'];
  operation: Function = TaskNoopOperation;
  schedulerSubscription!: Subscription;

  private _args = [];

  task(fn: Function, ...args: any) {
    if (typeof fn !== 'function') {
      throw new Error('Invalid type for task. Please use a function.');
    }

    this._args.concat(args);
    this.operation = fn;

    return this;
  }

  next(value?: JobDescriptor | any) {
    if (value instanceof JobDescriptor) {
      this.set(value);
    } else {
      this.set('running', value);
    }

    super.next(this.get());
  }

  error(erro: JobDescriptor | any) {
    if (erro instanceof JobDescriptor) {
      this.set(erro);
    } else {
      this.set('failed', erro);
    }

    super.error(this.get());
  }

  complete() {
    this.set('complete', this.descriptor.value, this.descriptor.details);
    super.complete();
  }

  get() {
    return JobDescriptor.create(this.descriptor);
  }

  set(descriptor: JobDescriptor | StatusDescriptor, value?: any, detail?: any) {
    this.descriptor.set(descriptor, value, detail);
  }

  schedule() {
    const scheduler = asyncScheduler;

    const delay = this.descriptor.details.delay || 0;
    //const period = this.descriptor.details.repeate || -1;
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
