import { BehaviorSubject, combineLatest } from 'rxjs';
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
	monitor?: PidmanMonitor;
}

@Serializable()
export class PidmanGroup {
	public dataSubjects: Array<BehaviorSubject<{}>> = [];
	public errorSubjects: Array<BehaviorSubject<{}>> = [];
	public exitSubjects: Array<BehaviorSubject<{}>> = [];
	public closeSubjects: Array<BehaviorSubject<{}>> = [];
	protected processes: Array<PidmanProcess> = [];

	/**
	 * @param  {GroupOptions} privateoptions
	 * @param  {PidmanMonitor} publicmonitor
	 */
	constructor(
		@JsonProperty() private options: GroupOptions,
		public monitor?: PidmanMonitor
	) {
		if (!this.options.id) {
			this.options.id = PidmanStringUtils.getId();
		}

		this.setMonitor(monitor);
	}

	setMonitor(monitor: PidmanMonitor | undefined): void {
		if (!this.options.monitor) {
			this.options.monitor = monitor;
		}
	}

	/**
	 * @param  {ProcessOptions} process
	 */
	addProcess(options: ProcessOptions): void {
		const process = new PidmanProcess(options);
		process.setGroup(this);
		process.subscribe(this);

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

	startMonitoring(): void {
		if (!this.options.waitForCompletion) {
			combineLatest(...this.dataSubjects).subscribe(
				this.options.monitor?.onData
			);

			combineLatest(...this.errorSubjects).subscribe(
				this.options.monitor?.onError
			);

			combineLatest(...this.exitSubjects).subscribe(
				this.options.monitor?.onExit
			);

			combineLatest(...this.closeSubjects).subscribe(
				this.options.monitor?.onClose
			);
		} else {
			combineLatest(
				...this.dataSubjects,
				...this.errorSubjects,
				...this.exitSubjects,
				...this.closeSubjects
			).subscribe(
				this.options.monitor?.onComplete
			);
		}
	}

	run(): void {
		this.processes.forEach(process => process.run());
	}

	stop(): boolean {
		return true;
	}
}
