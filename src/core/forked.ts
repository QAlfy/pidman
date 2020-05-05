import { ChildProcess, spawn } from 'child_process';
import { PidmanSysUtils, PidmanProcessUtils } from '../utils';
import { ProcessOptions } from './process';
import { get } from 'lodash';

let forkedProcess: ForkedProcess;

export enum ForkedMessageType {
  started,
  closed,
  options,
  errored,
  kill,
  killed,
  killfail
}

export class ForkedMessage {
  constructor(public type: ForkedMessageType, public body: unknown) { }
}

/**
 * Forwards an error via IPC.
 *
 * @param  {} error
 * @returns void
 */
const catchError = function (error): void {
  if (process.send) {
    process.send(new ForkedMessage(ForkedMessageType.errored, error))
  }

  process.exit(error.errno);
};

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
      shell: false,
      detached: true,
      stdio: [null, process.stdout, process.stderr],
      windowsHide: true
    });

    this.#child?.on('close', (code, signal) => {
      if (process.send) {
        process.send(
          new ForkedMessage(ForkedMessageType.closed, {
            exitCode: code, exitSignal: signal
          })
        )
      }
    });
    this.#child?.on('error', catchError);
    this.#child.stderr?.on('data', catchError);

    this.#child.unref();

    return this.#child.pid;
  }

  /**
   * @returns number
   */
  getPid(): number {
    return this.#child!.pid;
  }

  /**
   * @returns ChildProcess
   */
  getChild(): ChildProcess {
    return this.#child!;
  }

  /**
   * @returns ProcessOptions
   */
  getOptions(): ProcessOptions {
    return this.options;
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
        let killed;
        const pid = forkedProcess.getPid();
        const exitCode = get(forkedProcess.getChild(), 'exitCode');

        if (pid && exitCode === null) {
          killed = await PidmanProcessUtils.killTree(
            pid, forkedProcess.getOptions().killSignal
          );
        } else {
          killed = false;
        }

        process.send(
          new ForkedMessage(ForkedMessageType.killed, killed)
        );
      } catch (err) {
        // console.error(err);
        process.send(
          new ForkedMessage(ForkedMessageType.killfail, err)
        );
      }
    }
  }
});
