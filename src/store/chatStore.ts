'use client';

import { create } from 'zustand';
import { ChatMessage } from '@/types';
import { MAX_CHAT_MESSAGES } from '@/lib/constants';

interface ChatState {
  messages: ChatMessage[];
  room: string;
  isOpen: boolean;
  isLoading: boolean;
  isMuted: boolean;
  onlineCount: number;

  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setRoom: (room: string) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  setMuted: (muted: boolean) => void;
  setOnlineCount: (count: number) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  room: 'english',
  isOpen: true,
  isLoading: false,
  isMuted: false,
  onlineCount: 1247,

  addMessage: (message) => {
    const messages = [...get().messages, message];
    // Keep only the last MAX_CHAT_MESSAGES messages
    if (messages.length > MAX_CHAT_MESSAGES) {
      messages.splice(0, messages.length - MAX_CHAT_MESSAGES);
    }
    set({ messages });
  },

  setMessages: (messages) => set({ messages }),

  setRoom: (room) => {
    set({ room, messages: [], isLoading: true });
    // Simulate loading messages for new room
    setTimeout(() => set({ isLoading: false }), 500);
  },

  setOpen: (isOpen) => set({ isOpen }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setLoading: (isLoading) => set({ isLoading }),

  setMuted: (isMuted) => set({ isMuted }),

  setOnlineCount: (onlineCount) => set({ onlineCount }),

  deleteMessage: (messageId) => {
    set({
      messages: get().messages.map((m) =>
        m.id === messageId ? { ...m, is_deleted: true } : m
      ),
    });
  },

  clearMessages: () => set({ messages: [] }),
}));
