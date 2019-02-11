import { Pipeline } from '../lib/pipeline';
// import { Observable, Observer } from 'rxjs';

describe('> Pipeline', () => {
  let pipeline: Pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  it('# Queue register', done => {
    pipeline.queues().subscribe(pipes => {
      for (const pipe of pipes) {
        expect(pipe[0] === 'my queue').toBeTruthy();
        done();
      }
    });

    /*const test = Observable.create((observer: Observer<any>) => {
      next(pipeline.queues(), observer);
    });

    test.subscribe((v: any) => {
      console.log(v);
      done();
    });*/

    pipeline.queue('my queue', console.log);
  });
});
