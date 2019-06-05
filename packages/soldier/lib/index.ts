import { pipeline, trigger } from './pipeline';

const pipeOne = pipeline([
  {
    attributes: {},
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

const pipeTwo = pipeline([
  {
    attributes: {
      repeatInterval: 1000,
    },
    deps: [{ provider: pipeOne, task: '[TASK-ONE] First Task' }, { provider: pipeOne, task: '[TASK-TWO] Second task' }],
    name: '[TASK-THREE] Third Task',
    task: () => {
      console.log('task three');
    },
  },
]);

// pipes.getQueueID('[TASK-ONE] First Task');

pipeTwo.pipe(trigger('[TASK-THREE] Third Task')).subscribe();
