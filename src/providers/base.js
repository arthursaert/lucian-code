export class BaseProvider {
  async complete(messages, model) {
    throw new Error("Method complete() must be implemented by subclass.");
  }
}
