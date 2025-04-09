import chalk from "chalk";

export class Logger {
  private constructor() {}
  static log(message: string) {
    console.log(chalk.blue(message));
  }

  static warn(message: string) {
    console.log(chalk.yellow(message));
  }

  static success(message: string) {
    console.log(chalk.green(message));
  }

  static error(messages: string) {
    console.log(chalk.red(messages));
  }
}
