export class UniqueEntityID {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? crypto.randomUUID();
  }

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }

  equals(id?: UniqueEntityID): boolean {
    if (!id) return false;
    return this.value === id.value;
  }
}
