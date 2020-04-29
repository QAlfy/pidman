const Pidman = require("../dist").Pidman;

const pm = new Pidman({
  monitor: {
    onData: (data) => {
      console.log(data);
    },
    onError: (data) => {
      console.log(data);
    },
    onExit: (data) => {
      console.log(data);
    },
    onClose: (data) => {
      console.log(data);
    },
  },
});

pm.addProcessGroup({
  user: "nico",
  waitForCompletion: false,
  processes: [
    {
      command: "ls",
      arguments: ["-lha", "/usr/share"],
    },
    {
      command: "echo",
      arguments: ["'foo'"],
    },
  ],
  monitor: {
    onData: (data) => {
      console.log(data);
    },
    onError: (data) => {
      console.log(data);
    },
    onExit: (data) => {
      console.log(data);
    },
    onClose: (data) => {
      console.log(data);
    },
    onComplete: (data) => {
      console.log(data);
    },
  },
});

pm.run();
