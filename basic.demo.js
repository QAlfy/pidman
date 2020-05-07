// Require the main Pidman class
const Pidman = require("./dist").Pidman;

// Optionally create groups manually
const PidmanGroup = require("./dist").PidmanGroup;

// Instantiate the Pidman's root class. Everything starts here.
const pm = new Pidman();

/*
This is a shared container working as a Pidman's events handler.
We could monitor a PidmanProcess individually or choose to include this
in the group options and monitor all of them from a single place.
*/
const monitor = {
  // Whenever a process outputs some data, it's injected here.
  onData: function (data) {
    console.log(data.output);
  },
  /*
  When the process closes/exits by whatever reason, being error or success.
  The argument provided to this function has all the required information
  as well as the corresponding PidmanProcess.
  */
  onClose: function (data) {
    console.log(data);
  },
};

/*
Optionally choose to create a new group by class.
We could just provide the options object to Pidman's addProcessGroup method,
which also accepts a PidmanGroup object.
*/
const group = new PidmanGroup({
  user: "nico",
  /*
  Initialize the processes in this group.
  We could use PidmanGroup's addProcess method which can accept an options object
  or a PidmanProcess object.
  */
  processes: [
    {
      command: "websockify",
      arguments: "-D 127.0.0.1:8080 0.0.0.0:80".split(" "),
      monitor,
    },
  ],
});

// Add one more process using PidmanGroup's addProcess method.
group.addProcess({
  // A forced typo. This will produce an error.
  command: "ls",
  arguments: ['foo'],
  monitor,
});

// attach group
pm.addProcessGroup(group);

// Let's run all these processes.
pm.run();

// And kill them at once after a few seconds.
setTimeout(async () => {
  try {
    const killed = await group.kill();

    console.info(killed);
  } catch (err) {
    console.error(err);
  }
}, 5000);
