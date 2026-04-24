import { Result } from './result';

export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}
