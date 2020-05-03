import { ChildProcess, spawn } from 'child_process';
import { PidmanSysUtils, PidmanProcessUtils } from '../utils';
import { ProcessOptions } from './process';

let forkedProcess: ForkedProcess;

export enum ForkedMessageType {
  started,
  options,
  kill,
  killed,
  fail
}

export class ForkedMessage {
  constructor(public type: ForkedMessageType, public body: unknown) { }
}
class ForkedProcess {
  #child?: ChildProcess;

  /**
   * @param  {ProcessOptions} privateoptions
   */
  constructor(private options: ProcessOptions) { }

  /**
   * @returns number
   */
  run(): number {
    this.#child = spawn(this.options.command, this.options.arguments || [], {
      uid:
        (!this.options.user && undefined) ||
        PidmanSysUtils.getUid(this.options.user || ''),
      cwd: this.options.path,
      env: this.options.envVars || {},
      gid: PidmanSysUtils.getGid(this.options.group || ''),
      shell: this.options.shell || false,
      // detached: true,
      stdio: 'inherit',
      windowsHide: true
    });

    // this.#child.unref();

    return this.#child.pid;
  }

  getPid(): number {
    return this.#child!.pid;
  }
}

process.on('message', async (msg: ForkedMessage) => {
  if (process.send) {
    // first handshake
    if (msg.type === ForkedMessageType.options) {
      const options = msg.body as ProcessOptions;

      // run process
      forkedProcess = new ForkedProcess(options);
      const pid = forkedProcess.run();

      // ACK
      process.send(
        new ForkedMessage(ForkedMessageType.started, pid)
      );
    }

    // kill request
    if (msg.type === ForkedMessageType.kill) {
      try {
        const childrens = await PidmanProcessUtils.getPidChildrens(
          forkedProcess.getPid()
        );
        const killed = await PidmanProcessUtils.killTree(
          forkedProcess.getPid()
        );

        process.send(
          new ForkedMessage(ForkedMessageType.killed, childrens)
        );
      } catch (err) {
        process.send(
          new ForkedMessage(ForkedMessageType.fail, err)
        );
      }
    }
  }
});
