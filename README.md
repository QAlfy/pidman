<h1 align="center">Welcome to Pidman 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/npm-%3E%3D5.5.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D9.3.0-blue.svg" />
  <a href="https://github.com/QAlfy/pidman/wiki" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="Copyright <YEAR> <COPYRIGHT HOLDER>" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> A rock solid process orchestration library for Node (**WIP: Work In Progress)**

### 🏠 [Homepage](https://qalfy.com)

## About

Pidman is a library designed to make external processes management an easy task.

It avoids the typical callback hell where you get into when using native API while at the same time enhances the default language functionality by allowing you to create groups of processes, monitor their activity and gives you the option to manage their statuses at any given time, whether there is data flowing, an error occurs or whenever the process closes or exits. If the later, you'll be provided with all the required information and metadata to help you react accordingly.

Grouping a serie of external commands or programs is useful when they depend on each other. Obviously, you can run an individual process if you don't need to manage a group.

### Goal

The goal of Pidman is to provide the most reliable process management tool without entering into dark territories. It has to remain simple to use and be easy to setup. In a matter of seconds, you should be able to orchestrate a series of programs or external commands while ensuring you won't loose their traces.

### Persistence

Pidman stores your groups and processes' metadata using *Connectors*. Currently, there is a single connector called *MemoryConnector* which can be persisted locally. You'll be always in sync with the processes that run over Pidman.

There are plans to add more connectors (NoSQL, MySQL, etc). Contributors are welcome.

### Logging

Pidman offers a vast set of logging targets to keep you informed. Thanks to the use of [Winston transports](https://github.com/winstonjs/winston/blob/master/docs/transports.md#winston-core), the output of this library can be redirected to either console, Slack, MongoDB, Sentry, New Relic, a file, a stream and dozens of other popular destinations.

Just include the preferred one when initializing the `Pidman` instance:

```
const SlackHook = require('winston-slack-webhook-transport');

const pm = new Pidman({
  logger: {
    transport: new SlackHook({
			webhookUrl: 'https://hooks.slack.com/services/xxx/xxx/xxx'
		})
  }
})
```

### Thread Behavior

Pidman run processes in forked mode. This means, your program's event loop won't be locked once you run a process using Pidman. This is a pseudo-thread mechanism that allows running commands and programs on the background while you keep communication for any event that might arise.

## Prerequisites

- npm >=5.8.0
- node >=9.3.0

## Install

```sh
npm i pidman
```

## Usage

For a quick hands-on usage explanation, check out the [basic demo](https://github.com/QAlfy/pidman/blob/master/test/basic.demo.js) and read the comments in there.


## Author

👤 **Nicolas Iglesias**

* Website: https://qalfy.com
* Github: [@webpolis](https://github.com/webpolis)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/QAlfy/pidman/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Nicolas Iglesias](https://github.com/webpolis).<br />
This project is [MIT](https://github.com/QAlfy/pidman/blob/master/LICENSE) licensed.
