import { createHash, randomBytes } from 'crypto';

export class PidmanStringUtils {
	public static getId(): string {
		return createHash('sha1').update(randomBytes(32)).digest('hex');
	}
}
