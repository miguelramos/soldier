import { Job } from './job';

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
  deps: string[];
  name: string;
  task: () => void;
  id?: string;
}
