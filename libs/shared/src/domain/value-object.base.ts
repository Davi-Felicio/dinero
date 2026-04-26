export abstract class ValueObject<T> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false;
    if (vo.constructor.name !== this.constructor.name) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
