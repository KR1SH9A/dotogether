import { apiClient } from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput, ReactionType } from '../types/todo';

export const todosApi = {
  list: () =>
    apiClient.get<Todo[]>('/todos').then(r => r.data),
  create: (input: CreateTodoInput) =>
    apiClient.post<Todo>('/todos', input).then(r => r.data),
  update: (id: number, input: UpdateTodoInput) =>
    apiClient.patch<Todo>(`/todos/${id}`, input).then(r => r.data),
  remove: (id: number) =>
    apiClient.delete<{ message: string }>(`/todos/${id}`).then(r => r.data),
  toggle: (id: number) =>
    apiClient.post<Todo>(`/todos/${id}/toggle`).then(r => r.data),
  addParticipants: (id: number, userIds: number[]) =>
    apiClient.post<Todo>(`/todos/${id}/participants`, { userIds }).then(r => r.data),
  removeParticipant: (id: number, participantId: number) =>
    apiClient.delete<{ message: string }>(`/todos/${id}/participants/${participantId}`).then(r => r.data),
  setReaction: (id: number, reaction: ReactionType) =>
    apiClient.post<Todo>(`/todos/${id}/reaction`, { reaction }).then(r => r.data),
  removeReaction: (id: number) =>
    apiClient.delete<Todo>(`/todos/${id}/reaction`).then(r => r.data),
};
