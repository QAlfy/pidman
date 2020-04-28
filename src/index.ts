interface PidmanOptions {
	id: string;
}

export class Pidman {
	constructor(private options: PidmanOptions) {}

	getOptions(): PidmanOptions {
		return this.options;
	}
}
