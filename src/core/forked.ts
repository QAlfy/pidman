import { ProcessOptions } from './process';
import { spawn } from 'child_process';
import { PidmanSysUtils } from '../utils';

let forkedProcess;

export enum ForkedMessageType {
  closed,
  error,
  started,
  options,
  kill,
  killed
}

export class ForkedMessage {
  constructor(public type: ForkedMessageType, public body: unknown) { }
}
export class ForkedProcess {
  constructor(private options: ProcessOptions) { }
}

process.on('message', (msg: ForkedMessage) => {
  // first handshake
  if (msg.type === ForkedMessageType.options) {
    const options = msg.body as ProcessOptions;

    forkedProcess = spawn(options.command, options.arguments || [], {
      uid:
        (!options.user && undefined) ||
        PidmanSysUtils.getUid(options.user || ''),
      cwd: options.path,
      env: options.envVars || {},
      gid: PidmanSysUtils.getGid(options.group || ''),
      shell: options.shell || false,
      detached: true,
      stdio: [null, 'pipe', 'pipe'],
      windowsHide: true
    });

    forkedProcess.unref();

    if (process.send) {
      process.send(options);
    }
  }
});
