import { UserPreferenceEntity } from '../entities/user-preference.entity';

export interface IUserPreferenceRepository {
  save(pref: UserPreferenceEntity): Promise<void>;
  findByUserId(userId: string): Promise<UserPreferenceEntity | null>;
}
