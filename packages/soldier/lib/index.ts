import { Pipeline } from './pipeline';
import { Job, JobDescriptor } from './job';
import { JobAttributes } from './typings';
import { interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

const pipeline = new Pipeline();

pipeline.queue('HELLO', (job: Job, descriptor: JobAttributes) => {
  //job.complete();
  if (descriptor.repeate) {
    const int: Subscription = interval(descriptor.repeate)
      .pipe(
        tap(() =>
          job.next(JobDescriptor.create('running', descriptor.data, descriptor))
        )
      )
      .subscribe(_ => int.unsubscribe());
    console.log(job, descriptor);
  }
});

pipeline.dispatch('HELLO', {
  data: 'Great balls of fire',
  delay: 2000,
  repeate: 5000
});

//setTimeout(() => pipeline.stop(), 5000);
