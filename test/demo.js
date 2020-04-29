const Pidman = require("../dist").Pidman;

const pm = new Pidman();

pm.addProcessGroup({
  user: "nico",
  processes: [
    {
      command: "websockify",
      arguments: ["-D 127.0.0.1:8080 0.0.0.0:80"],
    },
    // {
    //   command: "echo",
    //   arguments: ["'foo'"],
    // },
  ],
  monitor: {
    onData: ({ data, process, time, event }) => {
      console.log(data && data.toString());
    },
    onError: ({ error, process, time, event }) => {
      console.log(error);
    },
    onExit: ({ code, signal, process, time, event }) => {
      console.log([code, signal]);
      console.log(process);
    },
    onClose: ({ code, signal, process, time, event }) => {},
    onComplete: (data) => {},
  },
});

pm.run();
