export type StatusDescriptor = 'waiting' | 'running' | 'complete' | 'failed';

export interface JobAttributes {
  disable?: boolean;
  delay?: number;
  repeatInterval?: number|string;
  data?: object;
  timeout?: number;
  retry?: number;
}
