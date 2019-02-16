import { Observable, queueScheduler, Scheduler, from, Subject } from 'rxjs';
import { cpus, freemem, totalmem } from 'os';

let prevTimes = getCpuTimes();

export function getCpuTimes() {
  const processors = cpus();
  const times = {
    user: 0,
    sys: 0,
    nice: 0,
    idle: 0
  };

  processors.forEach((cpu) => {
    times.user += cpu.times.user;
    times.sys += cpu.times.sys;
    times.nice += cpu.times.nice;
    times.idle += cpu.times.idle;
  });

  return times;
}

export function getCpuUsage() {
  const times = getCpuTimes();
  const user = prevTimes.user - times.user;
  const sys = prevTimes.sys - times.sys;
  const nice = prevTimes.nice - times.nice;
  const idle = prevTimes.idle - times.idle;
  const usage = user + sys + nice;

  prevTimes = times;

  return (usage / (usage + idle)) * 100;
}

export function getMemoryUsage() {
  return (freemem() / totalmem()) * 100;
}

export interface IterableLike<T> {
  [Symbol.iterator]: () => Iterator<T> | IterableIterator<T>;
}

export function observableFromIterable<T>(
  i: IterableLike<T>,
  schedule: Scheduler
): Observable<T> {
  return from(i, schedule);
}

export function observableFromSet<T>(
  i: Set<T>,
  schedule: Scheduler = queueScheduler
): Observable<T> {
  return observableFromIterable(i, schedule);
}

export function observableFromMap<K, V>(
  i: Map<K, V>,
  schedule: Scheduler = queueScheduler
): Observable<[K, V]> {
  return observableFromIterable(i, schedule);
}

export class ObservableMap<K, V> extends Map<K, V> {
  private subject: Subject<IterableIterator<[K, V]>>;

  constructor() {
    super();

    this.subject = new Subject();
  }

  public set(key: K, value: V) {
    super.set(key, value);
    this.subject.next(super.entries());
    return this;
  }

  public delete(key: K) {
    const del = super.delete(key);

    this.subject.next(super.entries());

    return del;
  }

  public get(key: K) {
    return super.get(key);
  }

  public clear() {
    super.clear();
    this.subject.next(super.entries());
  }

  public has(key: K) {
    return super.has(key);
  }

  public listener() {
    return this.subject;
  }

  /*next(iter: any, observer: Observer<any>, previous = undefined) {
    let item: IteratorResult<any>;

    try {
      item = iter.next(previous);
    } catch (err) {
      return observer.error(err);
    }

    console.log('-----', item);
    const value = item.value;

    if (item.done) {
      return observer.complete();
    }

    observer.next(value);
    setImmediate(() => this.next(iter, observer, value));
  }*/
}
