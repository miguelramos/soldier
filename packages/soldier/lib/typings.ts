export type StatusDescriptor = 'waiting' | 'running' | 'complete' | 'failed';

export interface JobAttributes {
  disable?: boolean;
  delay?: number;
  repeate?: number;
  data?: Object;
}
