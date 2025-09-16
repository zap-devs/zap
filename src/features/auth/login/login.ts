import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";

import { logger } from "~/core/logger.js";
import { validatePhoneNumber } from "~/shared/utils/validation.js";

export class LoginPage extends Adw.Bin {
    protected declare _phoneEntry: Gtk.Entry;
    protected declare _errorLabel: Gtk.Label;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/features/auth/login/login.ui",
                InternalChildren: ["phoneEntry", "errorLabel"],
            },
            LoginPage,
        );
    }

    /**
     * Validate the phone number input
     */
    private validateInput(): boolean {
        const phoneNumber = this.getPhoneNumber();

        // Skip validation if field is empty - let the user type first
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            this.clearError(); // Clear any existing errors when empty
            return false; // Not valid, but don't show error for empty field
        }

        const validationResult = validatePhoneNumber(phoneNumber);

        if (!validationResult.isValid) {
            this.showError(validationResult.error || "Invalid phone number format");
            return false;
        }

        this.clearError();
        return true;
    }

    /**
     * Check if the current input is valid
     */
    public isValid(): boolean {
        return this.validateInput();
    }

    /**
     * Show error message
     */
    public showError(message: string): void {
        this._errorLabel.set_text(message);
        this._errorLabel.visible = true;
        this._errorLabel.add_css_class("error");

        // Add error styling to the entry
        this._phoneEntry.add_css_class("error");

        logger.warn(`Login validation error: ${message}`);
    }

    /**
     * Clear error message
     */
    public clearError(): void {
        this._errorLabel.set_text("");
        this._errorLabel.visible = false;
        this._errorLabel.remove_css_class("error");

        // Remove error styling from the entry
        this._phoneEntry.remove_css_class("error");
    }

    /**
     * Get the phone number from the input field
     */
    public getPhoneNumber(): string {
        return this._phoneEntry.get_text().trim();
    }

    /**
     * Clear the input field
     */
    public clear(): void {
        this._phoneEntry.set_text("");
        this.clearError();
    }

    /**
     * Focus the phone number input
     */
    public focus(): void {
        this._phoneEntry.grab_focus();
    }

    /**
     * Enable/disable the input field
     */
    public setEnabled(enabled: boolean): void {
        this._phoneEntry.sensitive = enabled;
    }
}
