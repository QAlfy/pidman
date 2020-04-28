import { execSync } from 'child_process';

export class PidmanSysUtils {
	public static getUid(user: string): number {
		if (process.platform === 'win32') {
			return 0;
		}

		const uid = execSync(`id -u ${user}`).toString();

		return Number(uid);
	}

	public static getGid(group: string): number {
		if (process.platform === 'win32') {
			return 0;
		}

		const uid = execSync(`id -g ${group}`).toString();

		return Number(uid);
	}
}
