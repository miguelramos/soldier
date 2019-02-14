# Soldier

[![Build Status](https://travis-ci.com/miguelramos/soldier.svg?branch=master)](https://travis-ci.com/miguelramos/soldier)
[![Coverage Status](https://coveralls.io/repos/github/miguelramos/soldier/badge.svg?branch=master)](https://coveralls.io/github/miguelramos/soldier?branch=master)
[![npm version](https://badge.fury.io/js/soldier.svg)](http://badge.fury.io/js/soldier)

> Reactive Soldier is an rxjs library for scheduling task to run on present or in an interval of time.

## Instalation

npm install @miguelramos/soldier

## Usage

```
import { Pipeline, Job, JobAttributes } from '@miguelramos/soldier';

const pipeline = new Pipeline();

pipeline.queue('TASK', (job: Job, _attrs?: JobAttributes) => {
  // perform your task
});

pipeline.dispatch('TASK', {
  repeatInterval: 1000
}).subscribe();

```
