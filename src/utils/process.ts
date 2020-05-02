import psTree from 'ps-tree';
import { Promise as promise } from 'bluebird';
import { spawnSync } from 'child_process';

export class PidmanProcessUtils {
  static async killTree(pid: number): Promise<boolean> {
    return new promise((resolve, reject) => {
      psTree(pid, (err, childrens) => {
        if (err) {
          reject(err);
        } else {
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
        }
      });
    });
  }
}
