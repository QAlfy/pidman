<h1 align="center">Welcome to Pidman 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.1.7-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/npm-%3E%3D5.8.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D9.3.0-blue.svg" />
  <a href="https://github.com/QAlfy/pidman/wiki" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="Copyright <YEAR> <COPYRIGHT HOLDER>" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> A rock solid process orchestration library for Node (**WIP: Work In Progress)**

### 🏠 [Homepage](https://pidman.qalfy.com)

## About

Pidman is a library designed to make external processes management an easy task.

It avoids the typical callback hell where you get into when using native API while at the same time enhances the default language functionality by allowing you to create groups of processes, monitor their activity and gives you the option to manage their statuses at any given time, whether there is data flowing, an error occurs or whenever the process closes or exits. If the later, you'll be provided with all the required information and metadata to help you react accordingly.

Grouping a serie of external commands or programs is useful when they depend on each other. Obviously, you can run an individual process if you don't need to manage a group.

### Goal

The goal of Pidman is to provide the most reliable process management tool without entering into dark territories. It has to remain simple to use and be easy to setup. In a matter of seconds, you should be able to orchestrate a series of programs or external commands while ensuring you won't loose their traces.

### Persistence

Pidman stores your groups and processes' metadata using _Connectors_. Currently, there is a single connector called _MemoryConnector_ which can be persisted locally. You'll be always in sync with the processes that run over Pidman.

There are plans to add more connectors (NoSQL, MySQL, etc). Contributors are welcome.

### Logging

Pidman offers a vast set of logging targets to keep you informed. Thanks to the use of [Winston transports](https://github.com/winstonjs/winston/blob/master/docs/transports.md#winston-core), the output of this library can be redirected to either console, Slack, MongoDB, Sentry, New Relic, a file, a stream and dozens of other popular destinations.

Just include the preferred one when initializing the `Pidman` instance:

```js
const SlackHook = require("winston-slack-webhook-transport");

const pm = new Pidman({
  logger: {
    transport: new SlackHook({
      webhookUrl: "https://hooks.slack.com/services/xxx/xxx/xxx",
    }),
  },
});
```

### Thread Behavior

Pidman run processes in forked mode. This means, your program's event loop won't be locked. This is a pseudo-thread mechanism that allows running commands and programs on the background while you keep listening for any event that might arise during execution of these commands.

### Daemons and Background Processes

If you run a command that spawns itself as a background process or daemon, Pidman will not be able to kill it properly. This is because the program will detach itself from its parent hence the new daemonized/background process will run unattached from the main Node's process running your code.

## Prerequisites

- npm >=5.8.0
- node >=9.3.0

## Install

```sh
npm i pidman
```

or

```sh
yarn add pidman
```

### Typescript Setup

If you use Typescript, don't forget to target ES2015 or higher in your `tsconfig.json`:

```json
  "compilerOptions": {
    ...
    "target": ["ES2015"],
    ...
  }
```

## API / Documentation

There is a detailed [API Documentation](https://pidman.qalfy.com/).

## Usage

For a quick hands-on usage explanation, check out the [basic demo](https://github.com/QAlfy/pidman/blob/master/test/basic.demo.js) and read the comments in there.

First, instantiate the main Pidman's class:

```js
import { Pidman } from "pidman";

const pm = new Pidman();
```

You can optionally provide a [PidmanOptions](https://pidman.qalfy.com/interfaces/_core_pidman_.pidmanoptions.html) to the [Pidman](https://pidman.qalfy.com/classes/_core_pidman_.pidman.html) constructor. An example would be specifying a [logging transport](#Logging).

### Group

Let's start adding a [PidmanGroup](https://pidman.qalfy.com/classes/_core_group_.pidmangroup.html) which will contain one or more [PidmanProcess](https://pidman.qalfy.com/classes/_core_process_.pidmanprocess.html).

A group simplifies the management of multiple commands and programs which relate to each other within a specific domain or context in your application. For example, if you need to run some maintenance commands when a user removes a document or triggers some action, then you can have a group do this job.

A `PidmanGroup` accepts a [GroupOptions](https://pidman.qalfy.com/interfaces/_core_group_.groupoptions.html) as unique argument on construction. The meaning of these options are explained [here](https://pidman.qalfy.com/interfaces/_core_group_.groupoptions.html). You can choose to initialize the processes using the `processes` array in the options or by later using the [addProcess](https://pidman.qalfy.com/classes/_core_group_.pidmangroup.html#addprocess) method:

```js
import { Pidman, PidmanGroup } from "pidman";

const pm = new Pidman();
const group = new PidmanGroup();

group.addProcess({
  path: "/home/someuser",
  command: "rm -rf ./docs",
});
```

The only required property is `command`, otherwise nothing runs. You can see a description of the different options [here](https://pidman.qalfy.com/interfaces/_core_process_.processoptions.html). You can optionally identify this group using a unique `id` string or let Pidman choose a random one.

### Process

A [PidmanProcess](https://pidman.qalfy.com/classes/_core_process_.pidmanprocess.html) can be run inside a group or isolated. Although, you can join a process to any group whenever you need to. It's a flexible mechanism.

```js
import { someEvent } from './events';
import { Pidman, PidmanGroup, PidmanProcess } from "pidman";

const pm = new Pidman();
const group = new PidmanGroup();

group.addProcess({
  path: "/home/someuser",
  command: "rm -rf ./docs",
});

const lockProcess = new PidmanProcess({
  user: "www",
  group: "www",
  path: "/var/www",
  command: "touch",
  arguments: ["lock"],
});

group.addProcess(lockProcess);

someEvent.on('doit', () => {
  group.run();
});
```

### Monitor Groups and Process

You can choose to monitor special events coming from a group's children processes or individually on each process. The callback signatures are detailed [here](https://pidman.qalfy.com/interfaces/_core_pidman_.pidmanmonitor.html):

```js
const group = new PidmanGroup({
  monitor: {
    onData: (data) => {
      // data.output is the process's stdout and stderr
      console.log(data.output)
    },
    onClose: (event) => {
      if (event.exitCode && event.exitCode !== 0) {
        console.error('ouch! something is wrong: ');
        console.error(event.process.output);
      } else {
        console.info(`process ${event.process.options.id} closed at ${event.time}`);
      }
    }
  }
});
```

### Kill 'Em All

By providing (**or not**) a valid [program termination signal](https://nodejs.org/api/process.html#process_signal_events), you can choose to kill all processes in a group at once or individually:

```js
const killed = await group.kill();
```

or

```js
const killed = await lockProcess.kill('SIGKILL');
```

## Author

👤 **Nicolas Iglesias**

- Website: https://pidman.qalfy.com
- Github: [@webpolis](https://github.com/webpolis)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/QAlfy/pidman/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Nicolas Iglesias](https://github.com/webpolis).<br />
This project is [MIT](https://github.com/QAlfy/pidman/blob/master/LICENSE) licensed.
