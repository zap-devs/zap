/**
 * Chat Service - Handles all chat-related business logic and data operations
 * Provides a clean separation between UI components and data management
 */

import { logger } from "~/core/logger.js";
import type {
    Chat,
    ChatServiceResponse,
    Message,
    PaginatedChatList,
    PaginatedMessageList,
    User,
} from "~/shared/models/chat.model.js";

/**
 * Chat Service class that manages chat data and operations
 */
export class ChatService {
    private static instance: ChatService;
    private chats: Chat[] = [];
    private messages: Message[] = [];
    private currentUser: User | null = null;

    private constructor() {
        this.initializeMockData();
    }

    /**
     * Get the singleton instance of ChatService
     */
    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    /**
     * Initialize mock data for development/testing
     */
    private initializeMockData(): void {
        logger.info("Initializing mock chat data");

        // Mock chat data
        this.chats = [
            {
                id: 1,
                name: "Alice Johnson",
                lastMessage: "See you tomorrow!",
                timestamp: "10:30 AM",
                unreadCount: 0,
            },
            {
                id: 2,
                name: "Bob Smith",
                lastMessage: "Thanks for the help",
                timestamp: "9:15 AM",
                unreadCount: 3,
            },
            {
                id: 3,
                name: "Team Chat",
                lastMessage: "Meeting at 2 PM",
                timestamp: "Yesterday",
                unreadCount: 1,
            },
            {
                id: 4,
                name: "Charlie Brown",
                lastMessage: "Did you see the game?",
                timestamp: "Yesterday",
                unreadCount: 0,
            },
        ];

        // Mock message data
        this.messages = [
            {
                id: 1,
                chatId: 1,
                text: "Hey, how are you doing?",
                timestamp: "10:00 AM",
                isOwn: false,
            },
            {
                id: 2,
                chatId: 1,
                text: "I'm doing great! Just finished that project.",
                timestamp: "10:05 AM",
                isOwn: true,
            },
            {
                id: 3,
                chatId: 1,
                text: "That's awesome! Can you share the details?",
                timestamp: "10:10 AM",
                isOwn: false,
            },
            {
                id: 4,
                chatId: 1,
                text: "Sure, I'll send you the files later today.",
                timestamp: "10:15 AM",
                isOwn: true,
            },
            {
                id: 5,
                chatId: 1,
                text: "See you tomorrow!",
                timestamp: "10:30 AM",
                isOwn: false,
            },
        ];
    }

    /**
     * Get all chats with pagination support
     */
    public async getChats(
        page: number = 1,
        pageSize: number = 50,
    ): Promise<ChatServiceResponse<PaginatedChatList>> {
        try {
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedChats = this.chats.slice(startIndex, endIndex);

            const result: PaginatedChatList = {
                chats: paginatedChats,
                pagination: {
                    page,
                    pageSize,
                    totalItems: this.chats.length,
                    totalPages: Math.ceil(this.chats.length / pageSize),
                },
            };

            logger.debug(`Retrieved ${paginatedChats.length} chats from page ${page}`);
            return { success: true, data: result };
        } catch (error) {
            logger.error("Failed to get chats:", error);
            return { success: false, error: "Failed to retrieve chats" };
        }
    }

    /**
     * Get messages for a specific chat
     */
    public async getMessages(
        chatId: number,
        page: number = 1,
        pageSize: number = 100,
    ): Promise<ChatServiceResponse<PaginatedMessageList>> {
        try {
            const chatMessages = this.messages.filter((msg) => msg.chatId === chatId);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedMessages = chatMessages.slice(startIndex, endIndex);

            const result: PaginatedMessageList = {
                messages: paginatedMessages,
                pagination: {
                    page,
                    pageSize,
                    totalItems: chatMessages.length,
                    totalPages: Math.ceil(chatMessages.length / pageSize),
                },
            };

            logger.debug(`Retrieved ${paginatedMessages.length} messages for chat ${chatId}`);
            return { success: true, data: result };
        } catch (error) {
            logger.error(`Failed to get messages for chat ${chatId}:`, error);
            return { success: false, error: "Failed to retrieve messages" };
        }
    }

    /**
     * Send a new message
     */
    public async sendMessage(chatId: number, text: string): Promise<ChatServiceResponse<Message>> {
        try {
            if (!this.currentUser) {
                return { success: false, error: "No user logged in" };
            }

            if (!text || text.trim().length === 0) {
                return { success: false, error: "Message cannot be empty" };
            }

            const newMessage: Message = {
                id: this.messages.length + 1,
                chatId,
                text: text.trim(),
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isOwn: true,
            };

            this.messages.push(newMessage);

            // Update the chat's last message
            const chat = this.chats.find((c) => c.id === chatId);
            if (chat) {
                chat.lastMessage = text.trim();
                chat.timestamp = newMessage.timestamp;
            }

            logger.info(`Message sent to chat ${chatId}: ${text.substring(0, 50)}...`);
            return { success: true, data: newMessage };
        } catch (error) {
            logger.error(`Failed to send message to chat ${chatId}:`, error);
            return { success: false, error: "Failed to send message" };
        }
    }

    /**
     * Mark chat as read
     */
    public async markChatAsRead(chatId: number): Promise<ChatServiceResponse<void>> {
        try {
            const chat = this.chats.find((c) => c.id === chatId);
            if (chat) {
                chat.unreadCount = 0;
                logger.info(`Chat ${chatId} marked as read`);
                return { success: true };
            }
            return { success: false, error: "Chat not found" };
        } catch (error) {
            logger.error(`Failed to mark chat ${chatId} as read:`, error);
            return { success: false, error: "Failed to mark chat as read" };
        }
    }

    /**
     * Get a specific chat by ID
     */
    public async getChat(chatId: number): Promise<ChatServiceResponse<Chat>> {
        try {
            const chat = this.chats.find((c) => c.id === chatId);
            if (chat) {
                return { success: true, data: chat };
            }
            return { success: false, error: "Chat not found" };
        } catch (error) {
            logger.error(`Failed to get chat ${chatId}:`, error);
            return { success: false, error: "Failed to retrieve chat" };
        }
    }

    /**
     * Set the current user
     */
    public setCurrentUser(user: User): void {
        this.currentUser = user;
        logger.info(`Current user set: ${user.name}`);
    }

    /**
     * Get the current user
     */
    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Clear current user (logout)
     */
    public clearCurrentUser(): void {
        this.currentUser = null;
        logger.info("Current user cleared");
    }

    /**
     * Search chats by name
     */
    public async searchChats(query: string): Promise<ChatServiceResponse<Chat[]>> {
        try {
            if (!query || query.trim().length === 0) {
                return { success: true, data: this.chats };
            }

            const searchTerm = query.toLowerCase().trim();
            const filteredChats = this.chats.filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm),
            );

            logger.debug(`Found ${filteredChats.length} chats matching "${query}"`);
            return { success: true, data: filteredChats };
        } catch (error) {
            logger.error(`Failed to search chats for query "${query}":`, error);
            return { success: false, error: "Failed to search chats" };
        }
    }

    /**
     * Add a new chat
     */
    public async addChat(chat: Omit<Chat, "id">): Promise<ChatServiceResponse<Chat>> {
        try {
            const newChat: Chat = {
                ...chat,
                id: this.chats.length + 1,
            };

            this.chats.unshift(newChat); // Add to beginning
            logger.info(`New chat added: ${newChat.name}`);
            return { success: true, data: newChat };
        } catch (error) {
            logger.error("Failed to add new chat:", error);
            return { success: false, error: "Failed to add chat" };
        }
    }

    /**
     * Delete a chat
     */
    public async deleteChat(chatId: number): Promise<ChatServiceResponse<void>> {
        try {
            const chatIndex = this.chats.findIndex((c) => c.id === chatId);
            if (chatIndex !== -1) {
                const deletedChat = this.chats.splice(chatIndex, 1)[0];
                // Also delete associated messages
                this.messages = this.messages.filter((msg) => msg.chatId !== chatId);

                logger.info(`Chat deleted: ${deletedChat.name}`);
                return { success: true };
            }
            return { success: false, error: "Chat not found" };
        } catch (error) {
            logger.error(`Failed to delete chat ${chatId}:`, error);
            return { success: false, error: "Failed to delete chat" };
        }
    }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
