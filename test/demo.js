const Pidman = require("../dist").Pidman;

const pm = new Pidman();

pm.addProcessGroup({
  user: "nico",
  processes: [
    // {
    //   command: "websockify",
    //   arguments: ["-D 127.0.0.1:8080 0.0.0.0:80".split(" ")],
    // },
    {
      command: "echso",
      arguments: ['"free"'],
      shell: false,
      monitor: {
        onData: function (data) {
          console.log(data);
        },
        onComplete: function (data) {
          console.log([1, data, this]);
        },
      },
    },
  ],
});

pm.run();
