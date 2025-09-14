/**
 * User Service - Handles user authentication and management
 * Provides centralized user-related business logic
 */

import { logger } from "../../core/logger.js";
import type { ChatServiceResponse, User } from "../models/chat.model.js";
import { UserStatus } from "../models/chat.model.js";
import { chatService } from "./chat-service.js";

/**
 * User Service class that manages user authentication and profile
 */
export class UserService {
    private static instance: UserService;
    private currentUser: User | null = null;
    private authenticatedUsers: Map<string, User> = new Map();

    private constructor() {
        this.initializeMockUsers();
    }

    /**
     * Get the singleton instance of UserService
     */
    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Initialize mock users for development/testing
     */
    private initializeMockUsers(): void {
        logger.info("Initializing mock user data");

        // Mock authenticated users
        const mockUsers: User[] = [
            {
                id: "user1",
                name: "John Doe",
                phoneNumber: "+1234567890",
                status: UserStatus.ONLINE,
            },
            {
                id: "user2",
                name: "Jane Smith",
                phoneNumber: "+0987654321",
                status: UserStatus.AWAY,
            },
        ];

        mockUsers.forEach((user) => {
            this.authenticatedUsers.set(user.phoneNumber, user);
        });
    }

    /**
     * Authenticate user with phone number
     */
    public async login(phoneNumber: string): Promise<ChatServiceResponse<User>> {
        try {
            // Validate phone number format
            const validationResult = this.validatePhoneNumber(phoneNumber);
            if (!validationResult.isValid) {
                return { success: false, error: validationResult.error };
            }

            // Check if user exists in our mock data
            const user = this.authenticatedUsers.get(phoneNumber);
            if (!user) {
                // Create new user for new phone numbers
                const newUser: User = {
                    id: `user_${Date.now()}`,
                    name: this.generateDisplayName(phoneNumber),
                    phoneNumber: phoneNumber,
                    status: UserStatus.ONLINE,
                };

                this.authenticatedUsers.set(phoneNumber, newUser);
                this.currentUser = newUser;

                // Update chat service with current user
                chatService.setCurrentUser(newUser);

                logger.info(`New user created and logged in: ${phoneNumber}`);
                return { success: true, data: newUser };
            }

            // User exists, log them in
            this.currentUser = user;
            user.status = UserStatus.ONLINE;

            // Update chat service with current user
            chatService.setCurrentUser(user);

            logger.info(`User logged in: ${phoneNumber}`);
            return { success: true, data: user };
        } catch (error) {
            logger.error(`Login failed for ${phoneNumber}:`, error);
            return { success: false, error: "Login failed" };
        }
    }

    /**
     * Logout current user
     */
    public async logout(): Promise<ChatServiceResponse<void>> {
        try {
            if (!this.currentUser) {
                return { success: false, error: "No user is currently logged in" };
            }

            const userPhone = this.currentUser.phoneNumber;
            this.currentUser.status = UserStatus.OFFLINE;

            // Clear current user from chat service
            chatService.clearCurrentUser();

            this.currentUser = null;

            logger.info(`User logged out: ${userPhone}`);
            return { success: true };
        } catch (error) {
            logger.error("Logout failed:", error);
            return { success: false, error: "Logout failed" };
        }
    }

    /**
     * Get current logged-in user
     */
    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    public isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    /**
     * Update user profile information
     */
    public async updateProfile(
        updates: Partial<Omit<User, "id" | "phoneNumber">>,
    ): Promise<ChatServiceResponse<User>> {
        try {
            if (!this.currentUser) {
                return { success: false, error: "No user is currently logged in" };
            }

            // Update user information
            Object.assign(this.currentUser, updates);

            // Update in authenticated users map
            this.authenticatedUsers.set(this.currentUser.phoneNumber, this.currentUser);

            // Update chat service with updated user
            chatService.setCurrentUser(this.currentUser);

            logger.info(`User profile updated: ${this.currentUser.phoneNumber}`);
            return { success: true, data: this.currentUser };
        } catch (error) {
            logger.error("Profile update failed:", error);
            return { success: false, error: "Profile update failed" };
        }
    }

    /**
     * Update user status
     */
    public async updateStatus(status: User["status"]): Promise<ChatServiceResponse<void>> {
        try {
            if (!this.currentUser) {
                return { success: false, error: "No user is currently logged in" };
            }

            this.currentUser.status = status;

            // Update in authenticated users map
            this.authenticatedUsers.set(this.currentUser.phoneNumber, this.currentUser);

            logger.info(`User status updated: ${this.currentUser.phoneNumber} - ${status}`);
            return { success: true };
        } catch (error) {
            logger.error("Status update failed:", error);
            return { success: false, error: "Status update failed" };
        }
    }

    /**
     * Validate phone number format
     */
    private validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
        // Remove all non-digit characters for validation
        const digitsOnly = phoneNumber.replace(/\D/g, "");

        // Check if it's empty
        if (!digitsOnly || digitsOnly.length === 0) {
            return { isValid: false, error: "Phone number cannot be empty" };
        }

        // Check minimum length (typically 10 digits for US, adjust as needed)
        if (digitsOnly.length < 10) {
            return { isValid: false, error: "Phone number must be at least 10 digits" };
        }

        // Check maximum length (typically 15 digits including country code)
        if (digitsOnly.length > 15) {
            return { isValid: false, error: "Phone number must be no more than 15 digits" };
        }

        // Check for valid country code format (starts with +)
        if (phoneNumber.startsWith("+")) {
            const countryCode = phoneNumber.substring(1, phoneNumber.length - 10);
            if (!/^\d{1,3}$/.test(countryCode)) {
                return { isValid: false, error: "Invalid country code format" };
            }
        }

        return { isValid: true };
    }

    /**
     * Generate display name from phone number
     */
    private generateDisplayName(phoneNumber: string): string {
        // Remove all non-digit characters
        const digitsOnly = phoneNumber.replace(/\D/g, "");

        // Format as (XXX) XXX-XXXX for US numbers
        if (digitsOnly.length === 10) {
            return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        }

        // For international numbers, just return the original
        return phoneNumber;
    }

    /**
     * Get all authenticated users (for admin purposes)
     */
    public getAllUsers(): User[] {
        return Array.from(this.authenticatedUsers.values());
    }

    /**
     * Check if a phone number is already registered
     */
    public isPhoneNumberRegistered(phoneNumber: string): boolean {
        return this.authenticatedUsers.has(phoneNumber);
    }

    /**
     * Get user by phone number
     */
    public getUserByPhoneNumber(phoneNumber: string): User | undefined {
        return this.authenticatedUsers.get(phoneNumber);
    }

    /**
     * Delete user account
     */
    public async deleteAccount(): Promise<ChatServiceResponse<void>> {
        try {
            if (!this.currentUser) {
                return { success: false, error: "No user is currently logged in" };
            }

            const phoneNumber = this.currentUser.phoneNumber;

            // Remove from authenticated users
            this.authenticatedUsers.delete(phoneNumber);

            // Clear current user
            this.currentUser = null;

            // Clear from chat service
            chatService.clearCurrentUser();

            logger.warn(`User account deleted: ${phoneNumber}`);
            return { success: true };
        } catch (error) {
            logger.error("Account deletion failed:", error);
            return { success: false, error: "Account deletion failed" };
        }
    }

    /**
     * Get user statistics
     */
    public getUserStats(): ChatServiceResponse<{
        totalUsers: number;
        currentUser: User | null;
        authenticated: boolean;
    }> {
        try {
            return {
                success: true,
                data: {
                    totalUsers: this.authenticatedUsers.size,
                    currentUser: this.currentUser,
                    authenticated: this.isAuthenticated(),
                },
            };
        } catch (error) {
            logger.error("Failed to get user stats:", error);
            return { success: false, error: "Failed to retrieve user statistics" };
        }
    }
}

// Export singleton instance
export const userService = UserService.getInstance();
