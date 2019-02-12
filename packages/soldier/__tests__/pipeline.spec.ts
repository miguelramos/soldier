import { Job } from '../lib/job';
import { Pipeline } from '../lib/pipeline';
import { JobAttributes } from '../lib/typings';

describe('> Pipeline', () => {
  let pipeline: Pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  it('# Should register queue in pipeline.', done => {
    pipeline.queues().subscribe(pipes => {
      for (const pipe of pipes) {
        expect(pipe[0] === 'my queue').toBeTruthy();
        done();
      }
    });

    pipeline.queue('my queue', console.log);
  });

  it('# Should dispatch single task', done => {
    pipeline.queue('TASK', (job: Job, _attrs?: JobAttributes) => {
      expect(job.descriptor.status === 'running').toBeTruthy();
    });

    const job = pipeline.get('TASK') as Job;

    const task = pipeline.dispatch('TASK', {
      delay: 0
    });

    task.subscribe(
      _job => {},
      _error => {},
      () => {
        expect(job.descriptor.status === 'complete').toBeTruthy();
        done();
      }
    );
  });

  it('# Should delay the task to run', done => {
    pipeline.queue('TASK', (job: Job, _attrs?: JobAttributes) => {
      expect(job.descriptor.details.delay === 1000).toBeTruthy();
    });

    const startTime = Date.now();
    const task = pipeline.dispatch('TASK', {
      delay: 1000
    });

    task.subscribe(
      _job => {},
      _error => {},
      () => {
        const period = Date.now() - startTime;

        expect(period > 1000).toBeTruthy();
        done();
      }
    );
  });

  it('# Should queue stop an interval', done => {
    let count = 0;

    pipeline.queue('TASK', (job: Job, _attrs?: JobAttributes) => {
      expect(job.descriptor.status === 'running').toBeTruthy();
      count++;
    });

    const job = pipeline.get('TASK') as Job;

    const task = pipeline.dispatch('TASK', {
      repeate: 1000
    });

    const subscription = task.subscribe(
      _job => {},
      _error => {},
      () => {
        job.schedulerSubscription.unsubscribe();

        subscription.unsubscribe();
        subscription.remove(subscription);

        expect(count === 5).toBeTruthy();

        done();
      }
    );

    setTimeout(() => pipeline.stop(), 5000);
  }, 6000);

  it('# Should throw error if task is not register', () => {
    expect(() => pipeline.dispatch('UNWANTED_TASK')).toThrowError(Error);
  });

  it('# Should throw error if queue task not a function', async () => {
    expect.assertions(1);

    try {
      await pipeline.queue('NOT_A_FUNCTION', 'hello' as any);
    } catch (e) {
      expect((<Error>e).message).toEqual(
        'Invalid type for task. Please use a function.'
      );
    }
  });
});
