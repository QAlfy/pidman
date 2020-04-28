const Pidman = new require('../dist').Pidman;

const pm = new Pidman({
	id: 'test',
});

console.log(pm.getOptions());
