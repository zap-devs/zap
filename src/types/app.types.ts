/**
 * Application-specific type definitions
 * Extends and customizes types for the Zap application
 */

import type { Chat, Message, User } from "../shared/models/chat.model";

/**
 * Application state structure
 */
export interface AppState {
    /** Current authentication state */
    auth: AuthState;
    /** Chat-related state */
    chat: ChatState;
    /** UI state */
    ui: UIState;
}

/**
 * Authentication state
 */
export interface AuthState {
    /** Whether user is authenticated */
    isAuthenticated: boolean;
    /** Current user information */
    currentUser: User | null;
    /** Login status */
    loginStatus: "idle" | "loading" | "success" | "error";
    /** Login error message */
    loginError: string | null;
}

/**
 * Chat state
 */
export interface ChatState {
    /** List of chats */
    chats: Chat[];
    /** Currently selected chat */
    selectedChat: Chat | null;
    /** Messages for the selected chat */
    messages: Message[];
    /** Loading states */
    loading: {
        chats: boolean;
        messages: boolean;
        sending: boolean;
    };
    /** Error states */
    errors: {
        chats: string | null;
        messages: string | null;
        sending: string | null;
    };
}

/**
 * UI state
 */
export interface UIState {
    /** Current view/page */
    currentView: "welcome" | "login" | "chat";
    /** Sidebar visibility */
    sidebarVisible: boolean;
    /** Theme preference */
    theme: "light" | "dark" | "system";
    /** Notification preferences */
    notifications: {
        enabled: boolean;
        sound: boolean;
        desktop: boolean;
    };
}

/**
 * Action types for state management
 */
export type AppAction =
    | { type: "AUTH_LOGIN_START" }
    | { type: "AUTH_LOGIN_SUCCESS"; payload: User }
    | { type: "AUTH_LOGIN_ERROR"; payload: string }
    | { type: "AUTH_LOGOUT" }
    | { type: "CHAT_SET_CHATS"; payload: Chat[] }
    | { type: "CHAT_SELECT_CHAT"; payload: Chat }
    | { type: "CHAT_SET_MESSAGES"; payload: Message[] }
    | { type: "CHAT_SEND_MESSAGE_START" }
    | { type: "CHAT_SEND_MESSAGE_SUCCESS"; payload: Message }
    | { type: "CHAT_SEND_MESSAGE_ERROR"; payload: string }
    | { type: "UI_SET_VIEW"; payload: AppState["ui"]["currentView"] }
    | { type: "UI_TOGGLE_SIDEBAR" }
    | { type: "UI_SET_THEME"; payload: AppState["ui"]["theme"] };

/**
 * Component props base interface
 */
export interface ComponentProps {
    /** CSS class names */
    className?: string;
    /** Inline styles */
    style?: Record<string, string | number>;
    /** Test ID for testing */
    testId?: string;
    /** ARIA attributes for accessibility */
    aria?: Record<string, string>;
}

/**
 * Button component props
 */
export interface ButtonProps extends ComponentProps {
    /** Button label */
    label?: string;
    /** Button variant */
    variant?: "primary" | "secondary" | "danger" | "text";
    /** Button size */
    size?: "small" | "medium" | "large";
    /** Whether button is disabled */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Icon name */
    icon?: string;
    /** Click handler */
    onClick?: () => void;
    /** Button type */
    type?: "button" | "submit" | "reset";
}

/**
 * Input component props
 */
export interface InputProps extends ComponentProps {
    /** Input value */
    value?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Input type */
    type?: "text" | "password" | "email" | "tel" | "number";
    /** Whether input is disabled */
    disabled?: boolean;
    /** Whether input is required */
    required?: boolean;
    /** Maximum length */
    maxLength?: number;
    /** Minimum length */
    minLength?: number;
    /** Change handler */
    onChange?: (value: string) => void;
    /** Blur handler */
    onBlur?: () => void;
    /** Focus handler */
    onFocus?: () => void;
    /** Validation error */
    error?: string;
}

/**
 * Modal component props
 */
export interface ModalProps extends ComponentProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Modal title */
    title?: string;
    /** Modal content */
    children?: any;
    /** Close handler */
    onClose?: () => void;
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Modal size */
    size?: "small" | "medium" | "large" | "fullscreen";
}

/**
 * Toast/Notification props
 */
export interface ToastProps extends ComponentProps {
    /** Toast message */
    message: string;
    /** Toast type */
    type?: "info" | "success" | "warning" | "error";
    /** Duration in milliseconds */
    duration?: number;
    /** Whether to show close button */
    showClose?: boolean;
    /** Close handler */
    onClose?: () => void;
}

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
    /** Whether the operation was successful */
    success: boolean;
    /** Response data (if successful) */
    data?: T;
    /** Error message (if failed) */
    error?: string;
    /** HTTP status code or custom status */
    status?: number;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of items */
    totalItems: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there's a next page */
    hasNextPage: boolean;
    /** Whether there's a previous page */
    hasPreviousPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    /** Array of items */
    items: T[];
    /** Pagination information */
    pagination: PaginationInfo;
}

/**
 * Sort options
 */
export interface SortOptions {
    /** Field to sort by */
    field: string;
    /** Sort direction */
    direction: "asc" | "desc";
}

/**
 * Filter options
 */
export interface FilterOptions {
    /** Search query */
    search?: string;
    /** Filter by status */
    status?: string[];
    /** Date range */
    dateRange?: {
        start: Date;
        end: Date;
    };
    /** Custom filters */
    custom?: Record<string, unknown>;
}

/**
 * API request options
 */
export interface RequestOptions {
    /** Pagination options */
    pagination?: {
        page: number;
        pageSize: number;
    };
    /** Sort options */
    sort?: SortOptions[];
    /** Filter options */
    filter?: FilterOptions;
    /** Whether to include related data */
    include?: string[];
    /** Timeout in milliseconds */
    timeout?: number;
}

/**
 * Error types
 */
export enum ErrorType {
    VALIDATION = "VALIDATION",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    NOT_FOUND = "NOT_FOUND",
    NETWORK = "NETWORK",
    SERVICE = "SERVICE",
    UNKNOWN = "UNKNOWN",
}

/**
 * Application error
 */
export interface AppError {
    /** Error type */
    type: ErrorType;
    /** Error message */
    message: string;
    /** Error code */
    code?: string;
    /** Additional error data */
    data?: Record<string, unknown>;
    /** Original error (if any) */
    originalError?: Error;
}

/**
 * Loading states
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Theme configuration
 */
export interface ThemeConfig {
    /** Theme name */
    name: string;
    /** Whether it's a dark theme */
    isDark: boolean;
    /** Primary color */
    primary: string;
    /** Secondary color */
    secondary: string;
    /** Background color */
    background: string;
    /** Surface color */
    surface: string;
    /** Text color */
    text: string;
    /** CSS variables */
    cssVariables: Record<string, string>;
}

/**
 * Local storage keys
 */
export enum StorageKey {
    USER = "zap_user",
    THEME = "zap_theme",
    NOTIFICATIONS = "zap_notifications",
    CHAT_STATE = "zap_chat_state",
    UI_STATE = "zap_ui_state",
    SETTINGS = "zap_settings",
}

/**
 * Event names for application events
 */
export enum AppEvent {
    /** User logged in */
    USER_LOGIN = "user:login",
    /** User logged out */
    USER_LOGOUT = "user:logout",
    /** Chat selected */
    CHAT_SELECTED = "chat:selected",
    /** Message sent */
    MESSAGE_SENT = "message:sent",
    /** Message received */
    MESSAGE_RECEIVED = "message:received",
    /** Theme changed */
    THEME_CHANGED = "theme:changed",
    /** Settings updated */
    SETTINGS_UPDATED = "settings:updated",
    /** Error occurred */
    ERROR_OCCURRED = "error:occurred",
}
