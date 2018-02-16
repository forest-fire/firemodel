let chalk: any;
export type LazyString = () => string;
export interface IStackFrame {
  getTypeName: LazyString;
  getFunctionName: LazyString;
  getMethodName: LazyString;
  getFileName: LazyString;
  getLineNumber: LazyString;
  getColumnNumber: LazyString;
  isNative: LazyString | string;
}

export interface IVerboseError {
  /** A short and unique identifier for the error; typically would not have any spaces in it */
  code: string;
  /** A user-friendly description of the error message */
  message: string;
  module?: string;
  function?: string;
  fileName?: string;
  stackFrames?: any[];
}
export class VerboseError extends Error implements IVerboseError {
  public static useColor: false;
  public static filePathDepth: 3;
  /**
   * If you want to use a library like stack-trace(node) or stacktrace-js(client) add in the "get"
   * function that they provide
   */
  public static setStackParser(fn: (err: IVerboseError) => any) {
    VerboseError.stackParser = fn;
  }

  private static stackParser(err: VerboseError): void | any[] {
    return undefined;
  }

  public code: string;
  public message: string;
  public module?: string;
  public function?: string;
  public stackFrames?: IStackFrame[];

  constructor(err: IVerboseError, ...args: any[]) {
    super(...args);
    this.code = err.code;
    this.message = err.message;
    this.module = err.module;
    this.function = err.function;
    if (VerboseError.useColor) {
      // tslint:disable-next-line:no-implicit-dependencies
      chalk = require("chalk");
    }
    const stackFrames = VerboseError.stackParser(this);
    if (stackFrames) {
      this.stackFrames = stackFrames.filter(
        frame => (frame.getFileName() || "").indexOf("common-types") === -1
      );
      this.function = stackFrames[0].getMethodName();
      this.stack =
        this.message +
        "\n\n" +
        this.stackFrames
          .map(frame => {
            const isNative =
              typeof frame.isNative === "function" ? frame.isNative() : frame.isNative;
            const colorize = (content: string) =>
              VerboseError.useColor && isNative ? chalk.grey.italic(content) : content;
            const className = frame.getTypeName() ? frame.getTypeName() + " → " : "";
            const functionName =
              frame.getMethodName() || frame.getFunctionName() || "<anonymous>";
            const classAndFunction = VerboseError.useColor
              ? chalk.bold(`${className}${functionName}`)
              : `${className}${functionName}`;
            const fileName = (frame.getFileName() || "")
              .split("/")
              .slice(-1 * VerboseError.filePathDepth)
              .join("/");
            const details = isNative
              ? "( native function )"
              : `[ line ${frame.getLineNumber()}, col ${frame.getColumnNumber()} in ${fileName} ]`;

            return colorize(`\t at ${classAndFunction} ${details}`);
          })
          .join("\n");
    } else {
      this.stack = this.stack
        .split("\n")
        .filter(line => line.indexOf("VerboseError") === -1)
        .join("\n");
    }
  }

  public toString() {
    return this.message + this.stack;
  }

  public toJSON() {
    return JSON.stringify(this.toObject(), null, 2);
  }

  public toObject() {
    return {
      code: this.code,
      message: this.message,
      module: this.module
    };
  }
}
