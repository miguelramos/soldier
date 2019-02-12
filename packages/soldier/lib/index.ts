import { Pipeline } from './pipeline';
import { Job } from './job';
import { JobAttributes } from './typings';
// import { interval, Subscription } from 'rxjs';
// import { tap } from 'rxjs/operators';

const pipeline = new Pipeline();

pipeline.queue('HELLO', (job: Job, descriptor: JobAttributes) => {
  //job.complete();
  /*if (descriptor.repeate) {
    const int: Subscription = interval(descriptor.repeate)
      .pipe(tap(() => job.next(JobDescriptor.create(job.descriptor))))
      .subscribe(_ => int.unsubscribe());
    console.log(job, descriptor);
  }*/
  console.log(job, descriptor);
});

const task = pipeline.dispatch('HELLO', {
  data: 'Great balls of fire'
});

if (task) {
  task.subscribe(
    _success => {
      console.log('success');
    },
    _error => {
      console.log('error');
    },
    () => {
      console.log('complete');
    }
  );
}

setTimeout(() => pipeline.stop(), 20000);
