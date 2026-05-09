export interface UserSummary {
  id: number;
  username: string;
}

export type ReactionType = 'like' | 'dislike';

export interface Todo {
  id: number;
  name: string;
  about: string;
  isCompleted: boolean;
  reminderTime?: string | null;
  owner: UserSummary;
  participants: UserSummary[];
  likesCount: number;
  dislikesCount: number;
  myReaction: ReactionType | null;
}

export interface CreateTodoInput {
  name: string;
  about?: string;
  reminderTime?: string | null;
}

export interface UpdateTodoInput {
  name?: string;
  about?: string;
  reminderTime?: string | null;
}
