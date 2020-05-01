const Pidman = require("../dist").Pidman;

const pm = new Pidman();
const monitor = {
  onData: function (data) {
    console.log(data && data.toString());
  },
  onComplete: function (data) {
    console.log(data);
  },
};

pm.addProcessGroup({
  user: "nico",
  processes: [
    {
      command: "websockify",
      arguments: "-D 127.0.0.1:8080 0.0.0.0:80".split(" "),
      monitor,
      shell: true,
    },
    {
      command: "ecsho",
      arguments: ['"free"'],
      shell: false,
      monitor,
    },
  ],
});

pm.run();
