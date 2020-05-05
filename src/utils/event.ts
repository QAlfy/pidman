import { reduce } from "lodash";

export class PidmanEventUtils {
  /**
   * @param  {any} data
   * @returns any
   */
  static parseMessage(data: any): any {
    let output = { output: '' };

    output = reduce(data, (acc, val) => {
      if (val instanceof Buffer) {
        acc.output += val.toString();
      } else if (val instanceof Object) {
        acc = { ...acc, ...val };
      }

      return acc;
    }, output);

    if (output.output === '') {
      delete output.output;
    }

    return ({
      ...output,
      time: Date.now()
    });
  }
}
