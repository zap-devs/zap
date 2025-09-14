import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { ChatWelcome } from "./chat-welcome.js";
import { logger } from "./logger.js";

// Define chat data structure
interface Chat {
    id: number;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

// Define message data structure
interface Message {
    id: number;
    chatId: number;
    text: string;
    timestamp: string;
    isOwn: boolean;
}

export class ChatView extends Adw.Bin {
    private chats: Chat[] = [];
    private messages: Message[] = [];
    private listBox!: Gtk.ListBox;
    private messageContainer!: Gtk.Box;
    private contentBox!: Gtk.Box;
    private welcomeContainer!: Gtk.Box;
    private splitView!: Adw.NavigationSplitView;
    private welcomeScreen!: ChatWelcome | null;
    private userName: string = "";
    private userNameLabel!: Gtk.Label;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/chat-view.ui",
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

    private initializeMockData(): void {
        // Mock chat data
        this.chats = [
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

        // Mock message data
        this.messages = [
            {
                id: 1,
                chatId: 1,
                text: "Hey, how are you doing?",
                timestamp: "10:00 AM",
                isOwn: false,
            },
            {
                id: 2,
                chatId: 1,
                text: "I'm doing great! Just finished that project.",
                timestamp: "10:05 AM",
                isOwn: true,
            },
            {
                id: 3,
                chatId: 1,
                text: "That's awesome! Can you share the details?",
                timestamp: "10:10 AM",
                isOwn: false,
            },
            {
                id: 4,
                chatId: 1,
                text: "Sure, I'll send you the files later today.",
                timestamp: "10:15 AM",
                isOwn: true,
            },
            {
                id: 5,
                chatId: 1,
                text: "See you tomorrow!",
                timestamp: "10:30 AM",
                isOwn: false,
            },
        ];
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();

        // Get the widgets from the template
        this.listBox = this.get_template_child(ChatView.$gtype, "listBox") as Gtk.ListBox;
        this.messageContainer = this.get_template_child(
            ChatView.$gtype,
            "messageContainer",
        ) as Gtk.Box;
        this.contentBox = this.get_template_child(ChatView.$gtype, "contentBox") as Gtk.Box;
        this.welcomeContainer = this.get_template_child(
            ChatView.$gtype,
            "welcomeContainer",
        ) as Gtk.Box;
        this.splitView = this.get_template_child(
            ChatView.$gtype,
            "split_view",
        ) as Adw.NavigationSplitView;
        this.userNameLabel = this.get_template_child(
            ChatView.$gtype,
            "userNameLabel",
        ) as Gtk.Label;

        // Initialize mock data
        this.initializeMockData();

        // Initialize the list model for chats
        this.initializeChatList();

        // Show the welcome screen by default
        this.showWelcomeScreen();
    }

    private initializeChatList(): void {
        try {
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
                const chatIndex = i;
                const chatData = chat; // Store the actual chat data
                const messageContainer = this.messageContainer;
                const welcomeContainer = this.welcomeContainer;
                const messages = this.messages; // Store messages reference

                // Connect to row activation
                row.connect("activated", () => {
                    // Hide welcome container and show message container using closure references
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                    }
                    if (messageContainer) {
                        messageContainer.visible = true;
                    }

                    // Display chat messages using the provided chat data and messages
                    this.displayChatMessagesWithContainers(
                        chatData.id,
                        messageContainer,
                        messages,
                    );
                });

                this.listBox.append(row);
            }
        } catch (error) {
            logger.error("Error initializing fancy chat list:", error);
        }
    }

    private displayChatMessagesWithContainers(
        chatId: number,
        messageContainer: Gtk.Box,
        messages: Message[],
    ): void {
        if (!messageContainer) {
            return;
        }

        // Clear the message container
        let child = messageContainer.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            messageContainer.remove(child);
            child = next;
        }

        // Filter messages for this chat
        const chatMessages = messages.filter((message) => message.chatId === chatId);

        // Add messages to the container
        for (const message of chatMessages) {
            const messageWidget = this.createMessageWidget(message, messageContainer);
            messageContainer.append(messageWidget);
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
}
