import { Entity, UniqueEntityID } from '@dinero/shared';

export interface ICategoryProps {
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  budget?: number;
  isDefault: boolean;
  createdAt: Date;
}

export class CategoryEntity extends Entity<ICategoryProps> {
  private constructor(props: ICategoryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<ICategoryProps, 'createdAt'>,
    id?: UniqueEntityID,
  ): CategoryEntity {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    return new CategoryEntity({ ...props, createdAt: new Date() }, id);
  }

  static reconstitute(props: ICategoryProps, id: UniqueEntityID): CategoryEntity {
    return new CategoryEntity(props, id);
  }

  get userId(): string | undefined { return this.props.userId; }
  get name(): string { return this.props.name; }
  get icon(): string | undefined { return this.props.icon; }
  get color(): string | undefined { return this.props.color; }
  get budget(): number | undefined { return this.props.budget; }
  get isDefault(): boolean { return this.props.isDefault; }
  get createdAt(): Date { return this.props.createdAt; }
}
