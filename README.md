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

It avoids callbacks hell and API complexity while at the same time enhances the default language functionality by allowing you to create groups of processes, monitor their activity and gives you the option to manage their statuses at any given time, whether there is data flowing, an error occurs or whenever the process closes or exits. If the later, you'll be provided with all the required information and metadata to help you react accordingly.

Grouping a series of external commands or programs is useful when they depend on each other. Obviously, you can run an individual process if you don't need to manage a group.

### Goal

The goal of Pidman is to provide the most reliable process management tool without entering into dark territories. It has to remain simple to use and be easy to setup. In a matter of seconds, you should be able to orchestrate a series of programs or external commands while ensuring you won't loose their traces.

### Persistence

Pidman stores your groups and processes' metadata using *Connectors*. Currently, there is a single connector called *MemoryConnector* which can be persisted locally. You'll be always in sync with the processes that run over Pidman.

There are plans to add more connectors (NoSQL, MySQL, etc).


## Prerequisites

- npm >=5.5.0
- node >=9.3.0

## Install

```sh
yarn
```

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
