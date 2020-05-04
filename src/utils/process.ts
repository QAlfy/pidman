import terminate from 'terminate';
import { Promise as promise } from 'bluebird';

export class PidmanProcessUtils {
  /**
   * @param  {number} pid
   * @param  {NodeJS.Signals} signal?
   * @returns Promise
   */
  static async killTree(
    pid: number, signal?: NodeJS.Signals
  ): Promise<boolean> {
    return new promise(async (resolve, reject) => {
      try {
        try {
          terminate(pid, signal, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        } catch (err) {
          reject(err)
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
