import psTree from 'ps-tree';
import { Promise as promise } from 'bluebird';
import { spawnSync } from 'child_process';

export class PidmanProcessUtils {
  static async getPidChildrens(pid: number): Promise<any[]> {
    return new promise((resolve, reject) => {
      psTree(pid, (err, childrens) => {
        if (err) {
          reject(err);
        } else {
          resolve(childrens);
        }
      });
    });
  }

  static async killTree(pid: number): Promise<boolean> {
    return new promise(async (resolve, reject) => {
      try {
        const childrens = await PidmanProcessUtils.getPidChildrens(pid);

        if (process.platform !== 'win32') {
          try {
            spawnSync('kill', ['-9'].concat(childrens.map(p => p.PID)));

            resolve(true)
          } catch (err) {
            reject(err)
          }
        } else {
          resolve(true);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
