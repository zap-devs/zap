/**
 * Application constants for the Zap application
 * Centralized location for all app-wide constants and configuration
 */

/**
 * Application metadata
 */
export const APP_CONSTANTS = {
    /** Application name */
    NAME: "Zap",
    /** Application ID */
    ID: "sh.alisson.Zap",
    /** Application version */
    VERSION: "0.1.0",
    /** Application description */
    DESCRIPTION: "WhatsApp-style chat interface for GNOME",
    /** Developer name */
    DEVELOPER_NAME: "Alisson Lauffer",
    /** Developer contact */
    DEVELOPER_CONTACT: "me@alisson.sh",
    /** Application website */
    WEBSITE: "https://github.com/alissonlauffer/zap",
    /** Copyright information */
    COPYRIGHT: "© 2025 Alisson Lauffer",
    /** License type */
    LICENSE: "MIT",
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
    /** Default window dimensions */
    WINDOW: {
        DEFAULT_WIDTH: 800,
        DEFAULT_HEIGHT: 600,
        MIN_WIDTH: 360,
        MIN_HEIGHT: 200,
    },

    /** Chat list dimensions */
    CHAT_LIST: {
        MIN_WIDTH: 200,
        MAX_WIDTH: 300,
        DEFAULT_WIDTH_FRACTION: 0.3,
    },

    /** Message bubble styling */
    MESSAGE_BUBBLE: {
        MIN_WIDTH: 50,
        PADDING: "8px 12px",
        BORDER_RADIUS: "18px",
        MARGIN: "4px 0",
    },

    /** Avatar sizing */
    AVATAR: {
        DEFAULT_SIZE: 40,
        SMALL_SIZE: 32,
        LARGE_SIZE: 56,
    },

    /** Spacing */
    SPACING: {
        TINY: 3,
        SMALL: 6,
        MEDIUM: 12,
        LARGE: 18,
        XLARGE: 24,
    },

    /** Margins */
    MARGINS: {
        SMALL: 6,
        MEDIUM: 12,
        LARGE: 18,
    },
} as const;

/**
 * Validation constants
 */
export const VALIDATION_CONSTANTS = {
    /** Phone number validation */
    PHONE_NUMBER: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15,
        ALLOW_INTERNATIONAL: true,
    },

    /** Text input validation */
    TEXT: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 1000,
        MAX_LINES: 10,
        MAX_NAME_LENGTH: 50,
        MAX_MESSAGE_LENGTH: 500,
    },

    /** Message validation */
    MESSAGE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 500,
        ALLOW_EMPTY: false,
    },
} as const;

/**
 * Service constants
 */
export const SERVICE_CONSTANTS = {
    /** Pagination defaults */
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        DEFAULT_MESSAGE_PAGE_SIZE: 100,
        MAX_PAGE_SIZE: 200,
    },

    /** Mock data configuration */
    MOCK_DATA: {
        CHAT_COUNT: 4,
        MESSAGE_COUNT_PER_CHAT: 5,
        USER_COUNT: 2,
    },

    /** API endpoints (for future implementation) */
    API_ENDPOINTS: {
        BASE_URL: "https://api.zap.example.com",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        CHATS: "/chats",
        MESSAGES: "/messages",
        USERS: "/users",
    },
} as const;

/**
 * Logging constants
 */
export const LOGGING_CONSTANTS = {
    /** Default log level */
    DEFAULT_LOG_LEVEL: "WARN",

    /** Log categories */
    CATEGORIES: {
        AUTH: "AUTH",
        CHAT: "CHAT",
        UI: "UI",
        SERVICE: "SERVICE",
        VALIDATION: "VALIDATION",
        NETWORK: "NETWORK",
    },

    /** Log format */
    FORMAT: {
        TIMESTAMP: "YYYY-MM-DD HH:mm:ss",
        PREFIX: "[Zap]",
    },
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    /** Authentication errors */
    AUTH: {
        LOGIN_FAILED: "Login failed",
        LOGOUT_FAILED: "Logout failed",
        INVALID_PHONE_NUMBER: "Invalid phone number format",
        USER_NOT_FOUND: "User not found",
        NOT_AUTHENTICATED: "User is not authenticated",
    },

    /** Chat errors */
    CHAT: {
        CHAT_NOT_FOUND: "Chat not found",
        MESSAGE_SEND_FAILED: "Failed to send message",
        MESSAGE_NOT_FOUND: "Message not found",
        CHAT_LOAD_FAILED: "Failed to load chat data",
    },

    /** Validation errors */
    VALIDATION: {
        EMPTY_INPUT: "Input cannot be empty",
        INVALID_FORMAT: "Invalid format",
        TOO_SHORT: "Input is too short",
        TOO_LONG: "Input is too long",
        INVALID_CHARACTER: "Input contains invalid characters",
    },

    /** General errors */
    GENERAL: {
        UNKNOWN_ERROR: "An unknown error occurred",
        NETWORK_ERROR: "Network connection error",
        SERVICE_UNAVAILABLE: "Service is temporarily unavailable",
        PERMISSION_DENIED: "Permission denied",
    },
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    /** Authentication success */
    AUTH: {
        LOGIN_SUCCESS: "Login successful",
        LOGOUT_SUCCESS: "Logout successful",
        PROFILE_UPDATED: "Profile updated successfully",
    },

    /** Chat success */
    CHAT: {
        MESSAGE_SENT: "Message sent successfully",
        CHAT_LOADED: "Chat loaded successfully",
        MESSAGE_DELETED: "Message deleted successfully",
    },

    /** General success */
    GENERAL: {
        OPERATION_COMPLETED: "Operation completed successfully",
        DATA_SAVED: "Data saved successfully",
        SETTINGS_UPDATED: "Settings updated successfully",
    },
} as const;

/**
 * Theme constants
 */
export const THEME_CONSTANTS = {
    /** Light theme colors */
    LIGHT: {
        PRIMARY: "#3584e4",
        SECONDARY: "#9141ac",
        SUCCESS: "#26a269",
        WARNING: "#e5a50a",
        ERROR: "#e01b24",
        BACKGROUND: "#ffffff",
        SURFACE: "#f6f5f4",
    },

    /** Dark theme colors */
    DARK: {
        PRIMARY: "#78aeed",
        SECONDARY: "#c061cb",
        SUCCESS: "#33d17a",
        WARNING: "#f9f06b",
        ERROR: "#f66151",
        BACKGROUND: "#1e1e1e",
        SURFACE: "#2d2d2d",
    },
} as const;

/**
 * CSS class names
 */
export const CSS_CLASSES = {
    /** Message styling */
    MESSAGE: {
        BUBBLE: "message-bubble",
        OWN_MESSAGE: "own-message",
        SENT: "message-sent",
        RECEIVED: "message-received",
    },

    /** Chat styling */
    CHAT: {
        ROW: "chat-row",
        AVATAR: "chat-avatar",
        TIMESTAMP: "chat-timestamp",
        UNREAD_BADGE: "unread-badge",
    },

    /** UI components */
    UI: {
        BUTTON_PRIMARY: "suggested-action",
        BUTTON_PILL: "pill",
        FLAT_HEADER: "flat",
        BOXED_LIST: "boxed-list",
        CAPTION: "caption",
        DIM_LABEL: "dim-label",
        TITLE: "title",
    },
} as const;

/**
 * Resource paths
 */
export const RESOURCE_PATHS = {
    /** Application resources */
    APP: "/sh/alisson/Zap",

    /** JavaScript resources */
    JS: "/sh/alisson/Zap/js",

    /** UI resources */
    UI: "/sh/alisson/Zap/ui",

    /** CSS resources */
    CSS: "/sh/alisson/Zap/css",

    /** Icon resources */
    ICONS: "/sh/alisson/Zap/icons",
} as const;

/**
 * Icon names
 */
export const ICON_NAMES = {
    /** Application icons */
    APP: "sh.alisson.Zap",

    /** UI icons */
    UI: {
        SEND: "mail-send-symbolic",
        MENU: "open-menu-symbolic",
        SETTINGS: "applications-system-symbolic",
        ABOUT: "help-about-symbolic",
        LOGOUT: "system-log-out-symbolic",
    },
} as const;
