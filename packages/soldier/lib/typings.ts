import { Observable } from 'rxjs';
import { Pipeline } from './pipeline';

export enum StatusType {
  COMPLETE = 'complete',
  FAILED = 'failed',
  WAITING = 'waiting',
  RUNNING = 'running',
}

export type StatusDescriptor = StatusType;

export interface JobAttributes {
  data?: object;
  delay?: number;
  disable?: boolean;
  repeatInterval?: number | string;
  retry?: number;
  timeout?: number;
}

export interface Pipe {
  attributes: JobAttributes;
  deps: Array<{ provider: Pipeline<Pipe> | Observable<Pipe>; task: string }>;
  name: string;
  task: () => void;
  id?: string;
}
