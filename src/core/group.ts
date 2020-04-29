import { BehaviorSubject, forkJoin } from 'rxjs';
import { concatAll } from 'rxjs/operators';
import { JsonProperty, Serializable } from 'typescript-json-serializer';
import { PidmanMonitor } from './pidman';
import { PidmanProcess, ProcessOptions } from './';
import { PidmanStringUtils } from '../utils';

export interface GroupOptions {
	id?: string;
	user?: string;
	group?: string;
	envVars?: {};
	processes: Array<ProcessOptions>;
	waitForCompletion?: boolean;
	monitor: PidmanMonitor;
}

@Serializable()
export class PidmanGroup {
	public dataSubject: BehaviorSubject<{}>;
	public errorSubject: BehaviorSubject<{}>;
	public exitSubject: BehaviorSubject<{}>;
	public closeSubject: BehaviorSubject<{}>;
	protected processes: Array<PidmanProcess> = [];

	/**
	 * @param  {GroupOptions} privateoptions
	 * @param  {PidmanMonitor} publicmonitor
	 */
	constructor(
		@JsonProperty() private options: GroupOptions,
		public monitor: PidmanMonitor
	) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		this.dataSubject = new BehaviorSubject({});
		this.errorSubject = new BehaviorSubject({});
		this.exitSubject = new BehaviorSubject({});
		this.closeSubject = new BehaviorSubject({});

		this.setMonitor(monitor);
	}

	/**
	 * @param  {PidmanMonitor} monitor
	 * @returns void
	 */
	setMonitor(monitor: PidmanMonitor): void {
		if (!this.monitor) {
			this.options.monitor = monitor;
		}
	}

	/**
	 * @param  {ProcessOptions} process
	 */
	addProcess(options: ProcessOptions): void {
		const process = new PidmanProcess(options);
		process.setGroup(this);

		this.processes.push(process);
	}

	/**
	 * @returns GroupOptions
	 */
	getOptions(): GroupOptions {
		return this.options;
	}

	/**
	 * @returns Array<PidmanProcess>
	 */
	getProcesses(): Array<PidmanProcess> {
		return this.processes;
	}

	/**
	 * @returns void
	 */
	startMonitoring(): void {
		if (!this.options.waitForCompletion) {
			this.dataSubject?.subscribe(this.options.monitor?.onData);
			this.errorSubject?.subscribe(this.options.monitor?.onError);
			this.closeSubject?.subscribe(this.options.monitor?.onClose);
			this.exitSubject?.subscribe(this.options.monitor?.onExit);
		}
	}

	run(): void {
		this.processes.forEach(process => process.run());
	}

	/**
	 * @returns boolean
	 */
	stop(): boolean {
		let ret = true;

		this.processes.forEach(process => {
			ret = ret && process.stop();
		});

		return ret;
	}
}
