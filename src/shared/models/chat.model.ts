/**
 * Chat data models and interfaces
 * Defines the structure for chat-related data in the application
 */

/**
 * Interface representing a chat conversation
 */
export interface Chat {
    /** Unique identifier for the chat */
    id: number;
    /** Display name for the chat */
    name: string;
    /** Last message in the chat */
    lastMessage: string;
    /** Timestamp of the last message */
    timestamp: string;
    /** Number of unread messages */
    unreadCount: number;
    /** Optional avatar or icon for the chat */
    avatar?: string;
}

/**
 * Interface representing a chat message
 */
export interface Message {
    /** Unique identifier for the message */
    id: number;
    /** ID of the chat this message belongs to */
    chatId: number;
    /** Text content of the message */
    text: string;
    /** Timestamp when the message was sent */
    timestamp: string;
    /** Whether this message was sent by the current user */
    isOwn: boolean;
    /** Optional sender information */
    sender?: string;
    /** Message status (sent, delivered, read) */
    status?: MessageStatus;
}

/**
 * Enum for message status
 */
export enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
}

/**
 * Interface for user information
 */
export interface User {
    /** Unique identifier for the user */
    id: string;
    /** Display name */
    name: string;
    /** Phone number */
    phoneNumber: string;
    /** Optional avatar URL */
    avatar?: string;
    /** User status */
    status?: UserStatus;
}

/**
 * Enum for user status
 */
export enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    AWAY = "away",
    BUSY = "busy",
}

/**
 * Interface for chat service responses
 */
export interface ChatServiceResponse<T> {
    /** Whether the operation was successful */
    success: boolean;
    /** The data returned (if successful) */
    data?: T;
    /** Error message (if failed) */
    error?: string;
    /** HTTP status code or custom status */
    status?: number;
}

/**
 * Interface for pagination data
 */
export interface PaginationData {
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of items */
    totalItems: number;
    /** Total number of pages */
    totalPages: number;
}

/**
 * Interface for paginated chat list response
 */
export interface PaginatedChatList {
    /** Array of chats */
    chats: Chat[];
    /** Pagination information */
    pagination: PaginationData;
}

/**
 * Interface for paginated message list response
 */
export interface PaginatedMessageList {
    /** Array of messages */
    messages: Message[];
    /** Pagination information */
    pagination: PaginationData;
}

/**
 * Type guard to check if an object is a Chat
 */
export function isChat(obj: unknown): obj is Chat {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "name" in obj &&
        "lastMessage" in obj &&
        "timestamp" in obj &&
        "unreadCount" in obj
    );
}

/**
 * Type guard to check if an object is a Message
 */
export function isMessage(obj: unknown): obj is Message {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "chatId" in obj &&
        "text" in obj &&
        "timestamp" in obj &&
        "isOwn" in obj
    );
}

/**
 * Type guard to check if an object is a User
 */
export function isUser(obj: unknown): obj is User {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "name" in obj &&
        "phoneNumber" in obj
    );
}
