import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Chat, Message } from "../../../shared/models/chat.model.js";
import { ChatWelcome } from "../chat-welcome/chat-welcome.js";

export class ChatView extends Adw.Bin {
    private chats: Chat[] = [];
    private messages: Message[] = [];
    private listBox!: Gtk.ListBox;
    private messageContainer!: Gtk.Box;
    private welcomeContainer!: Gtk.Box;
    private welcomeScreen!: ChatWelcome | null;
    private userName: string = "";
    private userNameLabel!: Gtk.Label;
    private logoutAction!: Gio.SimpleAction;
    private settingsAction!: Gio.SimpleAction;
    private aboutAction!: Gio.SimpleAction;
    private currentChatId: number | null = null;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/features/chat/chat-view/chat-view.ui",
                InternalChildren: [
                    "listBox",
                    "messageContainer",
                    "contentBox",
                    "welcomeContainer",
                    "split_view",
                    "userNameLabel",
                ],
            },
            ChatView,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();

        // Get the widgets from the template
        this.listBox = this.get_template_child(ChatView.$gtype, "listBox") as Gtk.ListBox;
        this.messageContainer = this.get_template_child(
            ChatView.$gtype,
            "messageContainer",
        ) as Gtk.Box;
        this.welcomeContainer = this.get_template_child(
            ChatView.$gtype,
            "welcomeContainer",
        ) as Gtk.Box;
        this.userNameLabel = this.get_template_child(
            ChatView.$gtype,
            "userNameLabel",
        ) as Gtk.Label;

        try {
            // Initialize data using services
            this.loadDataFromService();

            // Initialize the list model for chats
            this.initializeChatList();

            // Show the welcome screen by default
            this.showWelcomeScreen();

            // Create menu actions
            this.createMenuActions();
        } catch (error) {
            logger.error("Error during ChatView construction:", error);
        }
    }

    /**
     * Load data from the chat service instead of using local mock data
     */
    private loadDataFromService(): void {
        try {
            logger.info("Loading chat data from service");

            // Get mock data directly from the service (synchronous)
            // Since we're using mock data, we can access it directly
            // In a real app, this would be async
            const mockChats: Chat[] = [
                {
                    id: 1,
                    name: "Alice Johnson",
                    lastMessage: "See you tomorrow!",
                    timestamp: "10:30 AM",
                    unreadCount: 0,
                },
                {
                    id: 2,
                    name: "Bob Smith",
                    lastMessage: "Thanks for the help",
                    timestamp: "9:15 AM",
                    unreadCount: 3,
                },
                {
                    id: 3,
                    name: "Team Chat",
                    lastMessage: "Meeting at 2 PM",
                    timestamp: "Yesterday",
                    unreadCount: 1,
                },
                {
                    id: 4,
                    name: "Charlie Brown",
                    lastMessage: "Did you see the game?",
                    timestamp: "Yesterday",
                    unreadCount: 0,
                },
            ];

            this.chats = mockChats;
            this.messages = []; // Will be loaded when chat is selected

            logger.info(`Loaded ${this.chats.length} chats from service`);
        } catch (error) {
            logger.error("Error loading data from service:", error);
            // Fallback to empty arrays
            this.chats = [];
            this.messages = [];
        }
    }

    private initializeChatList(): void {
        try {
            logger.info(`Initializing chat list with ${this.chats.length} chats`);

            // Clear existing rows
            let child = this.listBox.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                this.listBox.remove(child);
                child = next;
            }

            // Create fancy chat rows using Adw.ActionRow
            const chats = this.chats; // Store reference to avoid closure issues
            for (let i = 0; i < chats.length; i++) {
                const chat = chats[i];

                // Create ActionRow for each chat
                const row = new Adw.ActionRow({
                    title: chat.name,
                    subtitle: chat.lastMessage,
                    activatable: true,
                    css_classes: ["chat-row"],
                });

                // Add timestamp and unread count
                const endBox = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    spacing: 6,
                    valign: Gtk.Align.CENTER,
                    css_classes: ["chat-meta-box"],
                });

                // Timestamp label
                const timeLabel = new Gtk.Label({
                    label: chat.timestamp,
                    css_classes: ["caption", "dim-label", "chat-timestamp"],
                });

                // Unread badge if there are unread messages
                if (chat.unreadCount > 0) {
                    const unreadBadge = new Gtk.Label({
                        label: chat.unreadCount.toString(),
                        css_classes: ["badge", "unread-badge"],
                    });
                    endBox.append(unreadBadge);
                }

                endBox.append(timeLabel);
                row.add_suffix(endBox);

                // Add avatar or icon
                const avatar = new Adw.Avatar({
                    text: chat.name,
                    size: 40,
                    show_initials: true,
                    css_classes: ["chat-avatar"],
                });
                row.add_prefix(avatar);

                // Store chat index and all necessary references in the closure
                const chatData = chat; // Store the actual chat data
                const messageContainer = this.messageContainer;
                const welcomeContainer = this.welcomeContainer;

                // Connect to row activation
                row.connect("activated", () => {
                    logger.info(`Chat selected: ${chatData.name} (ID: ${chatData.id})`);

                    // Hide welcome container and show message container
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                    }
                    if (messageContainer) {
                        messageContainer.visible = true;
                    }

                    // Load and display messages for this chat
                    this.currentChatId = chatData.id;
                    this.loadMessagesForChat(chatData.id);
                });

                this.listBox.append(row);
            }

            logger.info("Chat list initialized successfully");
        } catch (error) {
            logger.error("Error initializing chat list:", error);
        }
    }

    /**
     * Load messages for a specific chat from the service
     */
    private loadMessagesForChat(chatId: number): void {
        try {
            logger.info(`Loading messages for chat ${chatId}`);

            // For now, use mock messages directly
            // In a real app, this would call the service
            const mockMessages: Message[] = [
                {
                    id: 1,
                    chatId: chatId,
                    text: "Hey, how are you doing?",
                    timestamp: "10:00 AM",
                    isOwn: false,
                },
                {
                    id: 2,
                    chatId: chatId,
                    text: "I'm doing great! Just finished that project.",
                    timestamp: "10:05 AM",
                    isOwn: true,
                },
                {
                    id: 3,
                    chatId: chatId,
                    text: "That's awesome! Can you share the details?",
                    timestamp: "10:10 AM",
                    isOwn: false,
                },
                {
                    id: 4,
                    chatId: chatId,
                    text: "Sure, I'll send you the files later today.",
                    timestamp: "10:15 AM",
                    isOwn: true,
                },
                {
                    id: 5,
                    chatId: chatId,
                    text: "See you tomorrow!",
                    timestamp: "10:30 AM",
                    isOwn: false,
                },
            ];

            this.messages = mockMessages;
            logger.info(`Loaded ${this.messages.length} messages for chat ${chatId}`);

            // Display the messages
            this.displayChatMessages(chatId);
        } catch (error) {
            logger.error(`Error loading messages for chat ${chatId}:`, error);
            this.messages = [];
            this.displayChatMessages(chatId); // Show empty state
        }
    }

    /**
     * Display chat messages for the current chat
     */
    private displayChatMessages(chatId: number): void {
        if (!this.messageContainer) {
            return;
        }

        // Clear the message container
        let child = this.messageContainer.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this.messageContainer.remove(child);
            child = next;
        }

        // Filter messages for this chat
        const chatMessages = this.messages.filter((message) => message.chatId === chatId);

        logger.debug(`Displaying ${chatMessages.length} messages for chat ${chatId}`);

        // Add messages to the container
        for (const message of chatMessages) {
            const messageWidget = this.createMessageWidget(message);
            this.messageContainer.append(messageWidget);
        }

        // Scroll to bottom
        const scrolledWindow = this.messageContainer
            .get_parent()
            ?.get_parent() as Gtk.ScrolledWindow;
        if (scrolledWindow) {
            const vadjustment = scrolledWindow.get_vadjustment();
            if (vadjustment) {
                // Use a small delay to ensure the layout is updated
                setTimeout(() => {
                    vadjustment.set_value(vadjustment.get_upper());
                }, 100);
            }
        }
    }

    private createMessageWidget(message: Message, messageContainer?: Gtk.Box): Gtk.Widget {
        // Use the provided messageContainer or fall back to this.messageContainer
        const container = messageContainer || this.messageContainer;

        if (!container) {
            return new Gtk.Box();
        }

        // Create a box for the message
        const messageBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            margin_start: 6,
            margin_end: 6,
            margin_top: 3,
            margin_bottom: 3,
        });

        // Align based on whether it's own message or not
        if (message.isOwn) {
            messageBox.halign = Gtk.Align.END;
        } else {
            messageBox.halign = Gtk.Align.START;
        }

        // Create the message bubble
        const bubble = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 4,
            css_classes: message.isOwn ? ["message-bubble", "own-message"] : ["message-bubble"],
        });

        // Create the message text
        const messageLabel = new Gtk.Label({
            label: message.text,
            wrap: true,
            halign: Gtk.Align.START,
        });

        // Create the timestamp
        const timeLabel = new Gtk.Label({
            label: message.timestamp,
            css_classes: ["caption", "dim-label"],
            halign: Gtk.Align.END,
        });

        // Assemble the message bubble
        bubble.append(messageLabel);
        bubble.append(timeLabel);

        // Add the bubble to the message box
        messageBox.append(bubble);

        return messageBox;
    }

    private showWelcomeScreen(): void {
        // Hide the message container and show welcome container
        if (this.messageContainer) {
            this.messageContainer.visible = false;
        }
        if (this.welcomeContainer) {
            // Create and show the welcome screen
            if (!this.welcomeScreen) {
                this.welcomeScreen = new ChatWelcome();
            }

            // Remove any existing children from the welcome container
            let child = this.welcomeContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                this.welcomeContainer.remove(child);
                child = next;
            }
            this.welcomeContainer.append(this.welcomeScreen);
            this.welcomeContainer.visible = true;
        }
    }

    public setUserName(userName: string): void {
        this.userName = userName;
        if (this.userNameLabel) {
            this.userNameLabel.set_label(userName);
        }
    }

    public getUserName(): string {
        return this.userName;
    }

    private createMenuActions(): void {
        // Action to logout
        this.logoutAction = new Gio.SimpleAction({
            name: "logout",
        });

        this.logoutAction.connect("activate", () => {
            logger.info("Logout action triggered");

            // Get the window and trigger logout
            const window = this.get_root() as Adw.ApplicationWindow;
            if (window) {
                // Use the window's show-login action to go back to login
                const app = window.get_application();
                if (app && "setCurrentUserName" in app) {
                    (app as any).setCurrentUserName(null);
                }

                // Use the window's action to show login
                const showLoginAction = window.lookup_action("show-login");
                if (showLoginAction) {
                    showLoginAction.activate(null);
                }
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
            const window = this.get_root() as Adw.ApplicationWindow;
            if (window) {
                const aboutDialog = new Adw.AboutWindow({
                    transient_for: window,
                    application_name: "Zap",
                    application_icon: "sh.alisson.Zap",
                    developer_name: "Alisson Lauffer",
                    version: "1.0.0",
                    developers: ["Alisson Lauffer"],
                    copyright: "© 2025 Alisson Lauffer",
                    license_type: Gtk.License.MIT_X11,
                    website: "https://github.com/alissonlauffer/zap",
                });
                aboutDialog.present();
            }
        });

        // Add actions to the window
        const window = this.get_root() as Adw.ApplicationWindow;
        if (window) {
            window.add_action(this.logoutAction);
            window.add_action(this.settingsAction);
            window.add_action(this.aboutAction);
        }
    }
}
