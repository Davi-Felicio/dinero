export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string,
  ) {}

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, undefined, error);
  }

  isFailure(): boolean {
    return !this.isSuccess;
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value of failed Result: ${this.error}`);
    }
    return this.value as T;
  }
}
