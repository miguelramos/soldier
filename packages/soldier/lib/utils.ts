import { cpus, freemem, totalmem } from 'os';
import { from, queueScheduler, Observable, Scheduler, Subject } from 'rxjs';

export function head<T>(collection: T[]) {
  return collection[0];
}

export function foot<T>(collection: T[]) {
  return collection[collection.length - 1];
}

// export const head = (array: any[]) => array[0];
let prevTimes = getCpuTimes();

export function getCpuTimes() {
  const processors = cpus();
  const times = {
    idle: 0,
    nice: 0,
    sys: 0,
    user: 0,
  };

  processors.forEach(cpu => {
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

// tslint:disable-next-line: max-line-length
export function observableFromIterable<T>({ i, schedule }: { i: IterableLike<T>; schedule: Scheduler }): Observable<T> {
  return from(i, schedule);
}

export function observableFromSet<T>({
  i,
  schedule = queueScheduler,
}: {
  i: Set<T>;
  schedule?: Scheduler;
}): Observable<T> {
  return observableFromIterable({ i, schedule });
}

export function observableFromMap<K, V>({
  i,
  schedule = queueScheduler,
}: {
  i: Map<K, V>;
  schedule?: Scheduler;
}): Observable<[K, V]> {
  return observableFromIterable({ i, schedule });
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

export function isType(s: any, o: any) {
  // tslint:disable-next-line:triple-equals
  return typeof s == o;
}

export function isString(s: string) {
  return isType(s, 'string');
}

export function isObject(f: object) {
  return !!f && isType(f, 'object');
}

export function isNode(n: any) {
  return n && n['nodeType'];
}

export function isNumber(n: number) {
  return isType(n, 'number');
}

export function isDate(n: Date) {
  return isObject(n) && !!n['getDay'];
}

export function isBool(n: boolean) {
  return n === true || n === false;
}

export function isValue(n: any) {
  const type = typeof n;
  // tslint:disable-next-line: max-line-length triple-equals
  return type == 'object' ? !!(n && n['getDay']) : type == 'string' || type == 'number' || isBool(n);
}
