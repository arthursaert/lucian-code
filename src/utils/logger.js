export class Logger {
  static info(message) {
    console.log(`[INFO] ${message}`);
  }

  static error(message) {
    console.error(`[ERROR] ${message}`);
  }

  static agent(step, status) {
    console.log(`\nStep: ${step}`);
    console.log(`Status: ${status}\n`);
  }
}
