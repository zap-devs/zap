/**
 * Validation utilities for the Zap application
 * Provides common validation functions for user input and data
 */

import { logger } from "../../core/logger.js";

/**
 * Phone number validation result
 */
export interface ValidationResult {
    /** Whether the validation passed */
    isValid: boolean;
    /** Error message if validation failed */
    error?: string;
    /** Cleaned/normalized value if validation passed */
    normalizedValue?: string;
}

/**
 * Validation options
 */
export interface ValidationOptions {
    /** Whether to allow international numbers */
    allowInternational?: boolean;
    /** Minimum length requirement */
    minLength?: number;
    /** Maximum length requirement */
    maxLength?: number;
    /** Whether empty values are allowed */
    allowEmpty?: boolean;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(
    phoneNumber: string,
    options: ValidationOptions = {},
): ValidationResult {
    const {
        allowInternational = true,
        minLength = 10,
        maxLength = 15,
        allowEmpty = false,
    } = options;

    try {
        // Check if empty is allowed
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            if (allowEmpty) {
                return { isValid: true, normalizedValue: "" };
            }
            return { isValid: false, error: "Phone number cannot be empty" };
        }

        // Trim whitespace
        const trimmed = phoneNumber.trim();

        // Remove all non-digit characters for validation
        const digitsOnly = trimmed.replace(/\D/g, "");

        // Check minimum length
        if (digitsOnly.length < minLength) {
            return {
                isValid: false,
                error: `Phone number must be at least ${minLength} digits`,
            };
        }

        // Check maximum length
        if (digitsOnly.length > maxLength) {
            return {
                isValid: false,
                error: `Phone number must be no more than ${maxLength} digits`,
            };
        }

        // Validate international format if allowed
        if (allowInternational && trimmed.startsWith("+")) {
            const countryCode = trimmed.substring(1, trimmed.length - (digitsOnly.length - 1));
            if (!/^\d{1,3}$/.test(countryCode)) {
                return {
                    isValid: false,
                    error: "Invalid country code format",
                };
            }
        }

        // Format the phone number for storage
        let normalizedValue = digitsOnly;
        if (allowInternational && trimmed.startsWith("+")) {
            normalizedValue = `+${digitsOnly}`;
        }

        logger.debug(`Phone number validation passed: ${phoneNumber} -> ${normalizedValue}`);
        return {
            isValid: true,
            normalizedValue,
        };
    } catch (error) {
        logger.error("Phone number validation error:", error);
        return {
            isValid: false,
            error: "Phone number validation failed",
        };
    }
}

/**
 * Validate text input (names, messages, etc.)
 */
export function validateText(
    text: string,
    options: ValidationOptions & {
        /** Whether to trim whitespace */
        trim?: boolean;
        /** Maximum number of lines (for multi-line text) */
        maxLines?: number;
        /** Disallowed characters/words */
        blacklist?: string[];
    } = {},
): ValidationResult {
    const {
        allowEmpty = false,
        minLength = 1,
        maxLength = 1000,
        trim = true,
        maxLines = 10,
        blacklist = [],
    } = options;

    try {
        // Check if empty is allowed
        if (!text || text.trim().length === 0) {
            if (allowEmpty) {
                return { isValid: true, normalizedValue: "" };
            }
            return { isValid: false, error: "Text cannot be empty" };
        }

        // Trim if requested
        const normalizedValue = trim ? text.trim() : text;

        // Check minimum length
        if (normalizedValue.length < minLength) {
            return {
                isValid: false,
                error: `Text must be at least ${minLength} characters`,
            };
        }

        // Check maximum length
        if (normalizedValue.length > maxLength) {
            return {
                isValid: false,
                error: `Text must be no more than ${maxLength} characters`,
            };
        }

        // Check line count for multi-line text
        const lines = normalizedValue.split("\n");
        if (lines.length > maxLines) {
            return {
                isValid: false,
                error: `Text must be no more than ${maxLines} lines`,
            };
        }

        // Check blacklist
        for (const blocked of blacklist) {
            if (normalizedValue.toLowerCase().includes(blocked.toLowerCase())) {
                return {
                    isValid: false,
                    error: "Text contains disallowed content",
                };
            }
        }

        logger.debug(`Text validation passed: ${text.length} characters`);
        return {
            isValid: true,
            normalizedValue,
        };
    } catch (error) {
        logger.error("Text validation error:", error);
        return {
            isValid: false,
            error: "Text validation failed",
        };
    }
}

/**
 * Validate email address format
 */
export function validateEmail(email: string, options: ValidationOptions = {}): ValidationResult {
    const { allowEmpty = false } = options;

    try {
        // Check if empty is allowed
        if (!email || email.trim().length === 0) {
            if (allowEmpty) {
                return { isValid: true, normalizedValue: "" };
            }
            return { isValid: false, error: "Email cannot be empty" };
        }

        // Trim whitespace
        const trimmed = email.trim().toLowerCase();

        // Basic email regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmed)) {
            return {
                isValid: false,
                error: "Invalid email format",
            };
        }

        logger.debug(`Email validation passed: ${email}`);
        return {
            isValid: true,
            normalizedValue: trimmed,
        };
    } catch (error) {
        logger.error("Email validation error:", error);
        return {
            isValid: false,
            error: "Email validation failed",
        };
    }
}

/**
 * Validate numeric input
 */
export function validateNumber(
    value: string | number,
    options: {
        /** Whether empty values are allowed */
        allowEmpty?: boolean;
        /** Minimum value */
        min?: number;
        /** Maximum value */
        max?: number;
        /** Whether to allow decimals */
        allowDecimal?: boolean;
        /** Number of decimal places allowed */
        decimalPlaces?: number;
    } = {},
): ValidationResult {
    const {
        allowEmpty = false,
        min = 0,
        max = Number.MAX_SAFE_INTEGER,
        allowDecimal = true,
        decimalPlaces = 2,
    } = options;

    try {
        // Check if empty is allowed
        if (value === "" || value === null || value === undefined) {
            if (allowEmpty) {
                return { isValid: true, normalizedValue: "0" };
            }
            return { isValid: false, error: "Number cannot be empty" };
        }

        // Convert to number
        const numValue = typeof value === "string" ? parseFloat(value) : value;

        // Check if it's a valid number
        if (Number.isNaN(numValue)) {
            return { isValid: false, error: "Invalid number format" };
        }

        // Check if it's finite
        if (!Number.isFinite(numValue)) {
            return { isValid: false, error: "Number must be finite" };
        }

        // Check decimal restriction
        if (!allowDecimal && !Number.isInteger(numValue)) {
            return { isValid: false, error: "Only whole numbers are allowed" };
        }

        // Check decimal places
        if (allowDecimal && decimalPlaces >= 0) {
            const decimalPart = numValue.toString().split(".")[1];
            if (decimalPart && decimalPart.length > decimalPlaces) {
                return {
                    isValid: false,
                    error: `Number can have at most ${decimalPlaces} decimal places`,
                };
            }
        }

        // Check range
        if (numValue < min || numValue > max) {
            return {
                isValid: false,
                error: `Number must be between ${min} and ${max}`,
            };
        }

        logger.debug(`Number validation passed: ${numValue}`);
        return {
            isValid: true,
            normalizedValue: numValue.toString(),
        };
    } catch (error) {
        logger.error("Number validation error:", error);
        return {
            isValid: false,
            error: "Number validation failed",
        };
    }
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
    for (const result of results) {
        if (!result.isValid) {
            return result;
        }
    }

    return { isValid: true };
}

/**
 * Create a validation function with custom rules
 */
export function createValidator(
    rules: Array<(value: string) => ValidationResult>,
): (value: string) => ValidationResult {
    return (value: string): ValidationResult => {
        for (const rule of rules) {
            const result = rule(value);
            if (!result.isValid) {
                return result;
            }
        }
        return { isValid: true, normalizedValue: value };
    };
}
