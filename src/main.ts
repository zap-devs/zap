import Adw from "gi://Adw?version=1";
import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { LogLevel, logger } from "./core/logger.js";
import { Window } from "./core/window/window.js";
import { LoginPage } from "./features/auth/login/login.js";
import { WelcomePage } from "./features/auth/welcome/welcome.js";
import { ChatContent } from "./features/chat/chat-content/chat-content.js";
import { ChatListItem } from "./features/chat/chat-list-item/chat-list-item.js";
import { ChatView } from "./features/chat/chat-view/chat-view.js";

/**
 * This class is the foundation of most complex applications.
 * It handles many things crucial for app developers:
 *  - Registers a D-Bus name for your application
 *  - Makes sure the application process is unique
 *  - Registers application resources like icons, ui files, menus, and shortcut dialogs.
 *  - Allows app developers to easily set up global actions and shortcuts
 *
 * Here we're using AdwApplication, which provides extra functionality by automatically
 * loading custom styles and initializing the libadwaita library.
 *
 * For more information on AdwApplication and its parent classes, see:
 *  - https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Application.html
 *  - https://docs.gtk.org/gtk4/class.Application.html
 *  - https://docs.gtk.org/gio/class.Application.html
 */
export class Application extends Adw.Application {
    private window?: Window;
    private cssLoaded: boolean = false;

    /**
     * When subclassing a GObject, we need to register the class with the
     * GObject type system. We do this here in the static initializer block,
     * as it needs to be run before everything else.
     *
     * For more information on subclassing and the abilities of
     * `GObject.registerClass()`, see https://gjs.guide/guides/gobject/subclassing.html
     */
    static {
        GObject.registerClass(Application);
    }

    constructor() {
        super({
            application_id: "sh.alisson.Zap",
            flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
        });

        // Initialize logger based on environment
        this.initializeLogger();

        /**
         * GActions are the most powerful tool a developer can use
         * to react to user input. There are different types of actions,
         * and actions can be attached to UI and shortcuts in multiple ways.
         *
         * In this example we're using GSimpleAction, as it's simplest
         * implementation of actions provided by gio.
         *
         * For more information, see:
         *  - https://gnome.pages.gitlab.gnome.org/gtk/gio/iface.Action.html
         *  - https://gnome.pages.gitlab.gnome.org/gtk/gio/iface.ActionGroup.html
         *  - https://gnome.pages.gitlab.gnome.org/gtk/gio/iface.ActionMap.html
         *
         * The application class implements GActionGroup and GActionMap,
         * providing us the ability to add actions directly to the application.
         * When we want to refer to the action elsewhere, we use the name of the
         * action group we used as a prefix. Actions directly added to applications
         * are prefixed with `app`.
         */
        const quit_action = new Gio.SimpleAction({ name: "quit" });
        quit_action.connect("activate", () => {
            this.quit();
        });

        this.add_action(quit_action);
        this.set_accels_for_action("app.quit", ["<Control>q"]);

        const show_about_action = new Gio.SimpleAction({ name: "about" });
        show_about_action.connect("activate", () => {
            const aboutDialog = new Adw.AboutDialog({
                application_name: _("Zap"),
                application_icon: "sh.alisson.Zap",
                developer_name: "Alisson Lauffer",
                version: "0.1",
                developers: ["Alisson Lauffer <me@alisson.sh>"],
                copyright: "© 2025 Alisson Lauffer",
                comments: _("An unofficial WhatsApp client for GNOME"),
            });

            aboutDialog.present(this.active_window);
        });

        this.add_action(show_about_action);

        Gio._promisify(Gtk.UriLauncher.prototype, "launch", "launch_finish");
    }

    // Initialize logger based on environment settings
    private initializeLogger(): void {
        // Check for debug environment variable or GJS debug flag
        const debugMode =
            GLib.getenv("GJS_DEBUG") === "1" ||
            GLib.getenv("ZAP_DEBUG") === "1" ||
            ARGV?.includes("--debug");

        if (debugMode) {
            logger.setLogLevel(LogLevel.DEBUG);
            logger.info("Logger initialized in DEBUG mode");
        } else {
            logger.setLogLevel(LogLevel.DEBUG);
            logger.info("Logger initialized in INFO mode");
        }
    }

    // Load CSS styles
    private loadCss(): void {
        if (this.cssLoaded) return;

        const cssProvider = new Gtk.CssProvider();
        cssProvider.load_from_resource("/sh/alisson/Zap/css/resources/styles/global.css");
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
        );

        this.cssLoaded = true;
    }

    // When overriding virtual functions, the function name must be `vfunc_$funcname`.
    public vfunc_activate(): void {
        if (!this.window) {
            this.window = new Window({ application: this });
        }

        // Load CSS after window is created and display is available
        this.loadCss();

        this.window.present();
    }
}

export function main(argv: string[]): Promise<number> {
    const app = new Application();
    // Explicitly reference the custom widgets to ensure their static initialization blocks run
    // This ensures that GObject.registerClass() is called for each widget
    void WelcomePage;
    void LoginPage;
    void ChatView;
    void ChatContent;
    void ChatListItem;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return app.runAsync(argv);
}
