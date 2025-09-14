import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import { validatePhoneNumber } from "../../../shared/utils/validation.js";

export class LoginPage extends Adw.Bin {
    private phoneEntry!: Gtk.Entry;
    private errorLabel!: Gtk.Label;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/features/auth/login/login.ui",
                InternalChildren: ["phoneEntry", "errorLabel"],
            },
            LoginPage,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();
        try {
            this.phoneEntry = this.get_template_child(LoginPage.$gtype, "phoneEntry") as Gtk.Entry;
            this.errorLabel = this.get_template_child(LoginPage.$gtype, "errorLabel") as Gtk.Label;

            // Set up validation and error handling
            this.setupValidation();

            logger.info("LoginPage constructed successfully");
        } catch (error) {
            logger.error("Failed to initialize LoginPage:", error);
        }
    }

    /**
     * Set up input validation and error handling
     */
    private setupValidation(): void {
        if (!this.phoneEntry) return;

        // Connect to text change events for real-time validation
        this.phoneEntry.connect("changed", () => {
            this.clearError();
        });

        // Note: GTK 4 doesn't have focus-out signal on GtkEntry
        // Validation will happen on form submission instead

        // Connect to activate event (Enter key)
        this.phoneEntry.connect("activate", () => {
            this.validateInput();
            if (this.isValid()) {
                // Trigger login action
                const window = this.get_root() as Adw.ApplicationWindow;
                if (window) {
                    const loginAction = window.lookup_action("win.login");
                    if (loginAction) {
                        loginAction.activate(null);
                    }
                }
            }
        });
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
        if (this.errorLabel) {
            this.errorLabel.set_text(message);
            this.errorLabel.visible = true;
            this.errorLabel.add_css_class("error");
        }

        // Add error styling to the entry
        if (this.phoneEntry) {
            this.phoneEntry.add_css_class("error");
        }

        logger.warn(`Login validation error: ${message}`);
    }

    /**
     * Clear error message
     */
    public clearError(): void {
        if (this.errorLabel) {
            this.errorLabel.set_text("");
            this.errorLabel.visible = false;
            this.errorLabel.remove_css_class("error");
        }

        // Remove error styling from the entry
        if (this.phoneEntry) {
            this.phoneEntry.remove_css_class("error");
        }
    }

    /**
     * Get the phone number from the input field
     */
    public getPhoneNumber(): string {
        if (this.phoneEntry) {
            const text = this.phoneEntry.get_text().trim();
            logger.debug(`Getting phone number from entry: "${text}"`);
            return text;
        }
        logger.debug("Phone entry not found, returning empty string");
        return "";
    }

    /**
     * Set the phone number in the input field
     */
    public setPhoneNumber(phoneNumber: string): void {
        if (this.phoneEntry) {
            this.phoneEntry.set_text(phoneNumber);
        }
    }

    /**
     * Clear the input field
     */
    public clear(): void {
        if (this.phoneEntry) {
            this.phoneEntry.set_text("");
        }
        this.clearError();
    }

    /**
     * Focus the phone number input
     */
    public focus(): void {
        if (this.phoneEntry) {
            this.phoneEntry.grab_focus();
        }
    }

    /**
     * Enable/disable the input field
     */
    public setEnabled(enabled: boolean): void {
        if (this.phoneEntry) {
            this.phoneEntry.sensitive = enabled;
        }
    }
}
