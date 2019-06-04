import { pipeline, trigger } from './pipeline';

const pipes = pipeline([
  {
    attributes: {
      repeatInterval: 1000,
    },
    deps: [],
    name: '[TASK-ONE] First Task',
    task: () => {
      console.log('task one');
    },
  },
  {
    attributes: {},
    deps: [],
    name: '[TASK-TWO] Second task',
    task: () => {
      console.log('task two');
    },
  },
]);

pipes.getQueueID('task one');

/*pipes
  .pipe(
    trigger('task one')
  )
  .subscribe();*/
