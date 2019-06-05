import crypto from 'crypto';
import { defer, from, Observable, Operator } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { Job } from './job';
import { JobDescriptor } from './job-descriptor';
import { Pipe, StatusType } from './typings';
import { head } from './utils';

/** @internal */
export class Pipeline<T> extends Observable<T> {
  private _queues: Map<string, [Pipe, Job]> = new Map();

  public lift<R>(operator: Operator<T, R>) {
    const observable = new Pipeline<R>();

    observable.source = this;
    observable.operator = operator;

    return observable;
  }

  public setQueue(id: string, pipe: [Pipe, Job]) {
    this._queues.set(id, pipe);
  }

  public getQueue(id: string) {
    return this._queues.get(id);
  }

  public hasQueue(id: string) {
    return this._queues.has(id);
  }

  public getQueueID(name: string) {
    return [...this._queues.values()].reduce((acc: null | string, current) => {
      const pipe = head(current) as Pipe;

      if (pipe.name === name) {
        acc = pipe.id as string;
      }

      return acc;
    }, null);
  }
}

export const pipeline = (source: Pipe[]) => {
  const { setPrototypeOf } = Object;

  const source$ = defer(() => from(source));

  setPrototypeOf(source$, new Pipeline<Pipe>());

  source.forEach(item => {
    const job = new Job().task(item.task);

    item.id = crypto.randomBytes(16).toString('hex');
    item.attributes = Object.assign(
      {},
      {
        data: {},
        delay: 0,
        disable: false,
        repeatInterval: -1,
        retry: 0,
        timeout: 0,
      },
      item.attributes,
    );

    job.set(JobDescriptor.create(StatusType.WAITING, null, item.attributes));

    (source$ as Pipeline<Pipe>).setQueue(item.id, [item, job]);
  });

  return source$ as Pipeline<Pipe>;
};

export const trigger: any = (key: string, _data?: unknown) => (source$: Observable<Pipe>) => {
  const [attr = null, job = null] = getAttrAndJob(source$, key) || [];

  if (attr && job) {
    return source$.pipe(
      flatMap(_pipes =>
        from(attr.deps).pipe(
          map(deps => {
            console.log(deps);
            return deps;
          }),
        ),
      ),
    );
  }
  /*return source$.pipe(
    flatMap(pipe => {
      debugger;
      return pipe && pipe.job
        ? pipe.job.schedule().pipe(
            retry(pipe.attributes.retry),
            // tslint:disable-next-line: no-empty
            tap(() => (pipe.job ? pipe.job.operation(pipe.job, pipe.attributes) : () => {})),
          )
        : of();
    }),
  );*/
  return source$ as Pipeline<Pipe>;
};

function getAttrAndJob(source: Pipeline<Pipe> | Observable<Pipe>, key: string) {
  const queueID = (source as Pipeline<Pipe>).getQueueID(key);
  return queueID ? (source as Pipeline<Pipe>).getQueue(queueID) : (source as Pipeline<Pipe>).getQueue(key);
}
