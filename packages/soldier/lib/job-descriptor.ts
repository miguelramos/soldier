import { JobAttributes, StatusDescriptor, StatusType } from './typings';
import { isString } from './utils';

// tslint:disable-next-line:no-var-requires
const hi = require('human-interval');

/**
 * Class to rule job internal data.
 *
 * @export
 * @class JobDescriptor
 */
export class JobDescriptor {
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
  // tslint:disable-next-line: max-line-length
  public static create(descriptor: JobDescriptor | StatusDescriptor, value?: any, detail?: JobAttributes) {
    const jobDescriptor = new JobDescriptor();
    jobDescriptor.set(descriptor, value, detail);

    return jobDescriptor;
  }
  public createdAt: Date = new Date();
  public updatedAt: Date = new Date();

  /**
   * Current job status
   *
   * @type {StatusDescriptor}
   * @memberof JobDescriptor
   */
  public status: StatusDescriptor = StatusType.WAITING;

  /**
   * Current job data
   *
   * @type {*}
   * @memberof JobDescriptor
   */
  public value: any = null;

  /**
   * Current job attributes
   *
   * @type {JobAttributes}
   * @memberof JobDescriptor
   */
  public details: JobAttributes = {
    data: {},
    delay: 0,
    disable: false,
    repeatInterval: -1,
    retry: 0,
    timeout: 0,
  };

  /**
   * Assigne jobdescriptor attributes, value and details
   *
   * @param {(JobDescriptor | StatusDescriptor)} descriptor
   * @param {*} [value]
   * @param {JobAttributes} [detail]
   * @memberof JobDescriptor
   */
  public set(descriptor: JobDescriptor | StatusDescriptor, value?: any, detail?: JobAttributes) {
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

    if (this.details.repeatInterval && isString(this.details.repeatInterval as string)) {
      this.details.repeatInterval = hi(this.details.repeatInterval);
    }
  }
}
