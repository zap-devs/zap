import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { LoginPage } from "../../features/auth/login/login.js";
import { userService } from "../../shared/services/user-service.js";
import { logger } from "../logger.js";

/**
 * Windows are the top-level widgets in our application.
 * They hold all of the other widgets, and when a window is closed
 * all of them are destroyed (unless `hide-on-close` is set).
 *
 * For most cases, you will want to use an AdwApplicationWindow
 * as the parent class for your windows. GtkApplicationWindow and
 * AdwApplicationWindow both integrate with your Application class,
 * getting information about the application like the app ID and tying
 * the window and application's lifecycles together. In addition,
 * both of these classes allow you to directly add actions to them.
 * These actions will be prefixed with `win`.
 *
 * For more information on windows, see:
 *  - https://docs.gtk.org/gtk4/class.Window.html
 *  - https://docs.gtk.org/gtk4/class.ApplicationWindow.html
 *  - https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ApplicationWindow.html
 */
export class Window extends Adw.ApplicationWindow {
    protected declare _stack: Adw.ViewStack;

    static {
        /**
         * Here we use a template. We define the resource path to the .ui file
         * and the `id` of the objects we want to be able to access programmatically.
         *
         * For a detailed guide on how to use templates in GTK4,
         * see https://rmnvgr.gitlab.io/gtk4-gjs-book/application/ui-templates-composite-widgets/
         *
         * **IMPORTANT**: Above where you see `private _toastOverlay!: Adw.ToastOverlay;`
         * is where we actually declare the field. Template children are handled by GJS,
         * but we need to tell TypeScript that they exist. We prepend the underscore
         * so we match the name of the field that GJS will generate, and add
         * the exclamation point to tell the typescript compiler where to look.
         */
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/core/window/window.ui",
                InternalChildren: ["stack"],
            },
            Window,
        );

        // Widgets allow you to directly add shortcuts to them when subclassing
        Gtk.Widget.add_shortcut(
            new Gtk.Shortcut({
                action: new Gtk.NamedAction({ action_name: "window.close" }),
                trigger: Gtk.ShortcutTrigger.parse_string("<Control>w"),
            }),
        );
    }

    private showLoginAction!: Gio.SimpleAction;
    private loginAction!: Gio.SimpleAction;
    private logoutAction!: Gio.SimpleAction;
    private settingsAction!: Gio.SimpleAction;
    private aboutAction!: Gio.SimpleAction;

    constructor(params?: Partial<Adw.ApplicationWindow.ConstructorProps>) {
        super(params);

        /**
         * Actions can also have parameters. In order to allow developers
         * to choose different types of parameters for their application,
         * we need to use something called a `GVariant`. When creating the
         * application we pass a string that denotes the type of the variant.
         *
         * For more information on variants, see:
         *  - https://docs.gtk.org/glib/struct.Variant.html
         *  - https://docs.gtk.org/glib/struct.VariantType.html
         */
        const openLink = new Gio.SimpleAction({
            name: "open-link",
            parameter_type: GLib.VariantType.new("s"),
        });

        openLink.connect("activate", (_source, param) => {
            if (param) {
                // When using a variant parameter, we need to get the type we expect
                const link = param.get_string()[0];

                const launcher = new Gtk.UriLauncher({ uri: link });

                launcher.launch(this, null).catch(console.error);
            }
        });

        // Action to send a message
        const sendMessage = new Gio.SimpleAction({
            name: "send-message",
        });

        sendMessage.connect("activate", () => {
            // Send message action handler
        });

        this.add_action(openLink);
        this.add_action(sendMessage);
    }

    /**
     * This method is called after the widget has been fully constructed
     * and all template children have been initialized.
     */
    public vfunc_constructed(): void {
        // Call the parent class's vfunc_constructed method
        super.vfunc_constructed();

        // Action to show the login screen
        this.showLoginAction = new Gio.SimpleAction({
            name: "show-login",
        });

        this.showLoginAction.connect("activate", () => {
            logger.debug("show-login action triggered");
            try {
                // Try to get the stack directly from the window using get_template_child
                const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
                logger.debug(`Stack retrieved in action: ${stack}`);
                logger.debug(`Stack type in action: ${stack?.constructor.name}`);

                if (stack) {
                    logger.debug(`Current stack page: ${stack.visible_child_name}`);
                    stack.visible_child_name = "login";
                    logger.debug(`Stack page changed to: ${stack.visible_child_name}`);
                } else {
                    logger.error("Could not retrieve stack in show-login action");
                }
            } catch (error) {
                logger.error("Error in show-login action:", error);
            }
        });

        // Action to login
        this.loginAction = new Gio.SimpleAction({
            name: "login",
        });

        this.loginAction.connect("activate", () => {
            this.handleLogin();
        });

        // Action to logout
        this.logoutAction = new Gio.SimpleAction({
            name: "logout",
        });

        this.logoutAction.connect("activate", () => {
            logger.info("Logout action triggered");

            // Get the app and trigger logout
            const app = this.get_application();
            if (app && "setCurrentUserName" in app) {
                (app as any).setCurrentUserName(null);
            }

            // Navigate to login screen
            const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
            if (stack) {
                stack.visible_child_name = "login";
            }
        });

        // Action to show settings
        this.settingsAction = new Gio.SimpleAction({
            name: "settings",
        });

        this.settingsAction.connect("activate", () => {
            logger.info("Settings action triggered");
            // TODO: Implement settings dialog
            console.log("Settings clicked");
        });

        // Action to show about dialog
        this.aboutAction = new Gio.SimpleAction({
            name: "about",
        });

        this.aboutAction.connect("activate", () => {
            logger.info("About action triggered");

            // Show about dialog
            const aboutDialog = new Adw.AboutDialog({
                application_name: "Zap",
                application_icon: "sh.alisson.Zap",
                developer_name: "Alisson Lauffer",
                version: "1.0.0",
                developers: ["Alisson Lauffer"],
                copyright: "© 2025 Alisson Lauffer",
                license_type: Gtk.License.MIT_X11,
                website: "https://github.com/alissonlauffer/zap",
            });
            aboutDialog.present(this);
        });

        this.add_action(this.showLoginAction);
        this.add_action(this.loginAction);
        this.add_action(this.logoutAction);
        this.add_action(this.settingsAction);
        this.add_action(this.aboutAction);
    }

    /**
     * Handle login action with proper validation and error handling
     */
    private async handleLogin(): Promise<void> {
        try {
            logger.info("Login action triggered");

            // Get the stack fresh each time to avoid context issues
            const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
            if (!stack) {
                logger.error("Could not retrieve stack in handleLogin");
                return;
            }

            logger.debug(`Stack retrieved in handleLogin: ${stack}`);
            logger.debug(`Stack type in handleLogin: ${stack.constructor.name}`);

            // Get the currently visible child - this should be the LoginPage
            const loginPage = stack.visible_child;
            logger.debug(`Currently visible child: ${loginPage?.constructor.name}`);

            if (!(loginPage instanceof LoginPage)) {
                logger.error(`Visible child is not a LoginPage: ${loginPage?.constructor.name}`);

                // Fallback: try to get by name if not currently visible
                const fallbackLoginPage = stack.get_child_by_name("login");
                if (fallbackLoginPage instanceof LoginPage) {
                    logger.debug("Using fallback login page found by name");
                    this.handleLoginPage(fallbackLoginPage, stack);
                } else {
                    logger.error("Could not find LoginPage instance");
                }
                return;
            }

            logger.debug(`Found LoginPage instance: ${loginPage.constructor.name}`);
            this.handleLoginPage(loginPage, stack);
        } catch (error) {
            logger.error("Login process failed:", error);
        }
    }

    /**
     * Handle login with a specific LoginPage instance
     */
    private async handleLoginPage(loginPage: LoginPage, stack: Adw.ViewStack): Promise<void> {
        try {
            logger.debug(`Using login page instance: ${loginPage.constructor.name}`);

            const phoneNumber = loginPage.getPhoneNumber();
            logger.info(`Login attempt with phone number: "${phoneNumber}"`);

            // Check if phone number is empty first
            if (!phoneNumber || phoneNumber.trim().length === 0) {
                logger.warn("Login attempt with empty phone number");
                loginPage.showError("Please enter a phone number");
                return;
            }

            // Validate phone number using the login page's validation
            const isValid = loginPage.isValid();
            logger.debug(`Login page validation result: ${isValid}`);
            if (!isValid) {
                logger.warn(`Phone number validation failed in login page`);
                // The login page already shows the error message
                return;
            }

            // Attempt login using user service
            const loginResult = await userService.login(phoneNumber);

            if (!loginResult.success) {
                logger.error(`Login failed: ${loginResult.error}`);
                loginPage.showError(loginResult.error || "Login failed");
                return;
            }

            logger.info(`Login successful for user: ${loginResult.data?.name || phoneNumber}`);

            // Navigate to chat view
            stack.visible_child_name = "chat";
            logger.info("Navigation to chat view completed");
        } catch (error) {
            logger.error("Login process failed:", error);
            // Show error to user
            loginPage.showError("An error occurred during login");
        }
    }
}
