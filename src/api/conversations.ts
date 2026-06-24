import client from './client';
import type { ApiResponse, Conversation, Message } from './types';

interface ConvItem extends Omit<Conversation, 'id'> {}

function mapConv(c: ConvItem): Conversation {
  return { ...c, id: c.conversation_id };
}

export async function getUserConversations(userId: number) {
  const res = await client.get<ApiResponse<ConvItem[]>>(`/conversations/user/${userId}`);
  return { ...res.data, data: res.data.data?.map(mapConv) };
}

export async function getConversationMessages(conversationId: number) {
  const res = await client.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
  return res.data;
}

export async function deleteConversation(id: number) {
  const res = await client.delete<ApiResponse>(`/conversations/${id}`);
  return res.data;
}
