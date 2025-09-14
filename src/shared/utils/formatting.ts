/**
 * Formatting utilities for the Zap application
 * Provides common formatting functions for dates, phone numbers, and text
 */

import { logger } from "../../core/logger.js";

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
    try {
        // Remove all non-digit characters
        const digitsOnly = phoneNumber.replace(/\D/g, "");

        // Handle different formats based on length
        if (digitsOnly.length === 10) {
            // US format: (XXX) XXX-XXXX
            return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
            // US format with country code: +1 (XXX) XXX-XXXX
            return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
        } else if (phoneNumber.startsWith("+")) {
            // International format: keep the + and format the rest
            const countryCodeLength = phoneNumber.length - digitsOnly.length + 1;
            const countryCode = digitsOnly.slice(0, countryCodeLength);
            const restOfNumber = digitsOnly.slice(countryCodeLength);

            if (restOfNumber.length >= 10) {
                // Format as: +CC (XXX) XXX-XXXX
                const areaCode = restOfNumber.slice(0, 3);
                const firstPart = restOfNumber.slice(3, 6);
                const secondPart = restOfNumber.slice(6, 10);
                return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
            } else {
                return `+${countryCode} ${restOfNumber}`;
            }
        } else {
            // Fallback: just return with spaces every 3-4 digits
            let formatted = "";
            for (let i = 0; i < digitsOnly.length; i += 3) {
                if (i > 0) formatted += " ";
                formatted += digitsOnly.slice(i, i + 3);
            }
            return formatted;
        }
    } catch (error) {
        logger.error("Phone number formatting error:", error);
        return phoneNumber; // Return original on error
    }
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(
    timestamp: string | Date,
    options: {
        /** Whether to show relative time (e.g., "2 hours ago") */
        relative?: boolean;
        /** Whether to show time only */
        timeOnly?: boolean;
        /** Whether to show date only */
        dateOnly?: boolean;
        /** Custom format string (using Date.toLocaleString options) */
        format?: Intl.DateTimeFormatOptions;
    } = {},
): string {
    try {
        const { relative = false, timeOnly = false, dateOnly = false, format } = options;

        let date: Date;
        if (typeof timestamp === "string") {
            // Try to parse the string
            if (timestamp.includes(":")) {
                // It's a time string like "10:30 AM"
                const today = new Date();
                const [time, period] = timestamp.split(" ");
                const [hours, minutes] = time.split(":").map(Number);

                let hour24 = hours;
                if (period === "PM" && hours !== 12) hour24 += 12;
                if (period === "AM" && hours === 12) hour24 = 0;

                date = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    hour24,
                    minutes,
                );
            } else if (timestamp.includes("/") || timestamp.includes("-")) {
                // It's a date string
                date = new Date(timestamp);
            } else if (["Today", "Yesterday", "Tomorrow"].includes(timestamp)) {
                // Handle relative date strings
                const today = new Date();
                switch (timestamp) {
                    case "Today":
                        date = today;
                        break;
                    case "Yesterday":
                        date = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case "Tomorrow":
                        date = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    default:
                        date = today;
                }
            } else {
                // Fallback to current date
                date = new Date();
            }
        } else {
            date = timestamp;
        }

        if (relative) {
            return getRelativeTime(date);
        }

        if (format) {
            return date.toLocaleString(undefined, format);
        }

        if (timeOnly) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        if (dateOnly) {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }

        // Default format: time for recent messages, date for older ones
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Same day - show time only
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (daysDiff === 1) {
            // Yesterday
            return "Yesterday";
        } else if (daysDiff < 7) {
            // This week - show day name
            return date.toLocaleDateString([], { weekday: "short" });
        } else {
            // Older - show date
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }
    } catch (error) {
        logger.error("Timestamp formatting error:", error);
        return timestamp.toString(); // Return original on error
    }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return "just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (weeks < 4) {
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (months < 12) {
        return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
}

/**
 * Format message text (handle emojis, links, etc.)
 */
export function formatMessageText(text: string): {
    formatted: string;
    hasLinks: boolean;
    hasEmojis: boolean;
} {
    try {
        let formatted = text;
        let hasLinks = false;
        let hasEmojis = false;

        // Check for emojis
        const emojiRegex =
            /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        hasEmojis = emojiRegex.test(text);

        // Find and format links
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const links = text.match(linkRegex);

        if (links) {
            hasLinks = true;
            // For now, just mark them - in a real app, you might create clickable links
            formatted = text.replace(linkRegex, "[LINK]");
        }

        // Trim whitespace
        formatted = formatted.trim();

        logger.debug(
            `Message text formatted: ${text.length} chars, links: ${hasLinks}, emojis: ${hasEmojis}`,
        );
        return { formatted, hasLinks, hasEmojis };
    } catch (error) {
        logger.error("Message text formatting error:", error);
        return { formatted: text, hasLinks: false, hasEmojis: false };
    }
}

/**
 * Format user display name
 */
export function formatDisplayName(
    name: string,
    options: {
        /** Maximum length */
        maxLength?: number;
        /** Whether to use initials if name is too long */
        useInitials?: boolean;
        /** Whether to capitalize words */
        capitalize?: boolean;
    } = {},
): string {
    try {
        const { maxLength = 20, useInitials = true, capitalize = true } = options;

        let formatted = name.trim();

        if (capitalize) {
            formatted = formatted
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
        }

        if (formatted.length > maxLength) {
            if (useInitials) {
                // Generate initials
                const words = formatted.split(" ");
                if (words.length > 1) {
                    formatted = words.map((word) => word.charAt(0).toUpperCase()).join("");
                } else {
                    formatted = formatted.substring(0, maxLength);
                }
            } else {
                formatted = formatted.substring(0, maxLength - 3) + "...";
            }
        }

        logger.debug(`Display name formatted: "${name}" -> "${formatted}"`);
        return formatted;
    } catch (error) {
        logger.error("Display name formatting error:", error);
        return name;
    }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    try {
        if (bytes === 0) return "0 B";

        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
    } catch (error) {
        logger.error("File size formatting error:", error);
        return `${bytes} B`;
    }
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
    try {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
        } else {
            return `${remainingSeconds}s`;
        }
    } catch (error) {
        logger.error("Duration formatting error:", error);
        return `${seconds}s`;
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
    text: string,
    maxLength: number,
    options: {
        /** Whether to break at word boundaries */
        wordBoundary?: boolean;
        /** Custom ellipsis string */
        ellipsis?: string;
    } = {},
): string {
    try {
        const { wordBoundary = true, ellipsis = "..." } = options;

        if (text.length <= maxLength) {
            return text;
        }

        let truncated = text.substring(0, maxLength - ellipsis.length);

        if (wordBoundary) {
            // Find the last space
            const lastSpace = truncated.lastIndexOf(" ");
            if (lastSpace > 0) {
                truncated = truncated.substring(0, lastSpace);
            }
        }

        return truncated + ellipsis;
    } catch (error) {
        logger.error("Text truncation error:", error);
        return text.substring(0, maxLength) + "...";
    }
}

/**
 * Clean and normalize text input
 */
export function cleanText(
    text: string,
    options: {
        /** Whether to trim whitespace */
        trim?: boolean;
        /** Whether to normalize whitespace (replace multiple spaces with single) */
        normalizeWhitespace?: boolean;
        /** Whether to remove control characters */
        removeControlChars?: boolean;
        /** Whether to convert to lowercase */
        lowercase?: boolean;
        /** Maximum length */
        maxLength?: number;
    } = {},
): string {
    try {
        const {
            trim = true,
            normalizeWhitespace = true,
            removeControlChars = true,
            lowercase = false,
            maxLength,
        } = options;

        let cleaned = text;

        // Remove control characters
        if (removeControlChars) {
            // Use a safer approach to remove control characters
            cleaned = cleaned.replace(/[^\x20-\x7E\s]/g, "");
        }

        // Normalize whitespace
        if (normalizeWhitespace) {
            cleaned = cleaned.replace(/\s+/g, " ");
        }

        // Trim
        if (trim) {
            cleaned = cleaned.trim();
        }

        // Convert case
        if (lowercase) {
            cleaned = cleaned.toLowerCase();
        }

        // Limit length
        if (maxLength && cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength);
        }

        logger.debug(`Text cleaned: "${text}" -> "${cleaned}"`);
        return cleaned;
    } catch (error) {
        logger.error("Text cleaning error:", error);
        return text;
    }
}
