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
    private _stack!: Adw.ViewStack;

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

        // Try to get the stack widget using get_template_child
        this._stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;

        // Action to show the login screen
        this.showLoginAction = new Gio.SimpleAction({
            name: "show-login",
        });

        this.showLoginAction.connect("activate", () => {
            const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
            if (stack) {
                stack.visible_child_name = "login";
            }
        });

        // Action to login
        this.loginAction = new Gio.SimpleAction({
            name: "login",
        });

        this.loginAction.connect("activate", () => {
            this.handleLogin();
        });

        this.add_action(this.showLoginAction);
        this.add_action(this.loginAction);
    }

    /**
     * Handle login action with proper validation and error handling
     */
    private async handleLogin(): Promise<void> {
        try {
            logger.info("Login action triggered");

            const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
            if (!stack) {
                logger.error("Stack widget not found");
                return;
            }

            const loginPage = stack.get_child_by_name("login");
            if (!(loginPage instanceof LoginPage)) {
                logger.error("Login page not found or invalid type");
                return;
            }

            const phoneNumber = loginPage.getPhoneNumber();
            logger.info(`Login attempt with phone number: "${phoneNumber}"`);

            // Check if phone number is empty first
            // if (!phoneNumber || phoneNumber.trim().length === 0) {
            //     logger.warn("Login attempt with empty phone number");
            //     loginPage.showError("Please enter a phone number");
            //     return;
            // }

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
                // TODO: Show error message to user
                return;
            }

            logger.info(`Login successful for user: ${loginResult.data?.name || phoneNumber}`);

            // Update application with user name
            const app = this.get_application();
            if (app && "setCurrentUserName" in app) {
                (app as any).setCurrentUserName(loginResult.data?.name || phoneNumber);
            }

            // Update chat view with user name
            const chatPage = stack.get_child_by_name("chat");
            if (chatPage && "setUserName" in chatPage) {
                (chatPage as any).setUserName(loginResult.data?.name || phoneNumber);
            }

            // Navigate to chat view
            stack.visible_child_name = "chat";
            logger.info("Navigation to chat view completed");
        } catch (error) {
            logger.error("Login process failed:", error);
            // TODO: Show error message to user
        }
    }
}
