const Pidman = require('../dist').Pidman;

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
	user: 'nico',
	processes: [
		{
			command: 'll',
			arguments: ['/usr/share'],
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
	},
});

pm.run();
