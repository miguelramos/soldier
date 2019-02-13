import { JobAttributes, StatusDescriptor } from './typings';

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
  public static create(
    descriptor: JobDescriptor | StatusDescriptor,
    value?: any,
    detail?: JobAttributes
  ) {
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
  public status: StatusDescriptor = 'waiting';

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
    repeatInterval: 0,
    delay: 0,
    disable: false
  };

  /**
   * Assigne jobdescriptor attributes, value and details
   *
   * @param {(JobDescriptor | StatusDescriptor)} descriptor
   * @param {*} [value]
   * @param {JobAttributes} [detail]
   * @memberof JobDescriptor
   */
  public set(
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
