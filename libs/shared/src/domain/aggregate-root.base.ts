import { Entity } from './entity.base';
import { UniqueEntityID } from './identifier.base';

export interface IDomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];

  protected constructor(props: T, id?: UniqueEntityID) {
    super(props, id);
  }

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
