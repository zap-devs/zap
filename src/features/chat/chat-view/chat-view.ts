import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
import type GtkTypes from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Chat, Message } from "../../../shared/models/chat.model.js";
import type { ChatContent } from "../chat-content/chat-content.js";
import { ChatListItem } from "../chat-list-item/chat-list-item.js";
import { ChatWelcome } from "../chat-welcome/chat-welcome.js";

export class ChatView extends Adw.Bin {
    protected declare _listBox: Gtk.ListBox;
    protected declare _welcomeContainer: Gtk.Box;
    protected declare _split_view: Adw.NavigationSplitView;
    protected declare _userNameLabel: GtkTypes.Label;
    protected declare _chatContent: ChatContent;

    private chats: Chat[] = [];
    private messages: Message[] = [];
    private welcomeScreen!: ChatWelcome | null;
    private userName: string = "";

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/features/chat/chat-view/chat-view.ui",
                InternalChildren: [
                    "listBox",
                    "welcomeContainer",
                    "split_view",
                    "userNameLabel",
                    "chatContent",
                ],
            },
            ChatView,
        );
    }

    public vfunc_realize(): void {
        super.vfunc_realize();

        logger.info("ChatView vfunc_realize called - template children should now be available");

        try {
            // Initialize data using services (template children are now available)
            this.loadDataFromService();

            // Initialize the list model for chats
            this.initializeChatList();

            // Show the welcome screen by default
            this.showWelcomeScreen();

            // Setup navigation handling for mobile view
            this.setupNavigationHandling();

            logger.info("ChatView realized successfully");
        } catch (error) {
            logger.error("Error during ChatView realization:", error);
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

            // Check if we have chats to display
            if (!this.chats || this.chats.length === 0) {
                logger.warn("No chats available to initialize list");
                return;
            }

            // Clear existing rows from list box
            this.clearListBox(this._listBox);

            // Create ChatListItem components for each chat
            const chats = this.chats; // Store reference to avoid closure issues
            for (let i = 0; i < chats.length; i++) {
                const chat = chats[i];

                // Create ChatListItem for each chat
                const chatItem = new ChatListItem();
                chatItem.setChatData(chat);

                // Store chat data and all necessary references in the closure
                const chatData = chat; // Store the actual chat data
                const welcomeContainer = this._welcomeContainer;

                // Connect to row activation
                chatItem.connect("activated", () => {
                    logger.info(`Chat selected: ${chatData.name} (ID: ${chatData.id})`);

                    // Update the conversation name in the header
                    this.setUserName(chatData.name);
                    logger.info(`Updated userNameLabel to: ${chatData.name}`);

                    // Hide welcome container and show chat content
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                        logger.info(`Hidden welcome container for chat: ${chatData.name}`);
                    }

                    // Load and display messages for this chat
                    this.loadMessagesForChat(chatData.id);

                    // Handle navigation for mobile view (collapsed split view)
                    if (this._split_view.collapsed) {
                        logger.info("Mobile view detected - navigating to content page");
                        // In collapsed mode, show the content page (libadwaita provides back button automatically)
                        this._split_view.show_content = true;
                    }

                    logger.info(`Chat selected and messages loaded: ${chatData.name}`);
                });

                // Add to list box
                this._listBox.append(chatItem);
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

            // Hide welcome screen and show chat content
            logger.info("Showing chat content, hiding welcome screen");

            this._welcomeContainer.visible = false;
            logger.info("Hidden welcome container");

            this._chatContent.visible = true;
            this._chatContent.loadMessages(chatId, this.messages);
            logger.info("Chat content loaded and shown");
        } catch (error) {
            logger.error(`Error loading messages for chat ${chatId}:`, error);
            this.messages = [];

            this._chatContent.clearMessages();
        }
    }

    private showWelcomeScreen(): void {
        logger.info(`=== SHOW WELCOME SCREEN ===`);

        // Reset conversation name to default when showing welcome screen
        this.setUserName("Chat");
        logger.info("Reset userNameLabel to 'Chat' for welcome screen");

        // Check if chat content is available before trying to access it
        this._chatContent.visible = false;
        logger.info("Hidden chat content");

        // Show welcome screen
        logger.info("Setting up welcome screen");

        // Create and show the welcome screen
        if (!this.welcomeScreen) {
            this.welcomeScreen = new ChatWelcome();
            logger.info("Created new ChatWelcome instance");
        }

        // Remove any existing children from the welcome container
        let child = this._welcomeContainer.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this._welcomeContainer.remove(child);
            child = next;
        }

        this._welcomeContainer.append(this.welcomeScreen);
        this._welcomeContainer.visible = true;
        logger.info("Welcome screen shown successfully");
    }

    public setUserName(userName: string): void {
        this.userName = userName;
        this._userNameLabel.set_label(userName);
    }

    public getUserName(): string {
        return this.userName;
    }

    /**
     * Setup navigation handling for mobile view
     */
    private setupNavigationHandling(): void {
        try {
            logger.info("Setting up navigation handling");

            // Connect to split view collapsed state changes
            this._split_view.connect("notify::collapsed", () => {
                logger.info(`Split view collapsed state changed: ${this._split_view.collapsed}`);
            });

            logger.info("Navigation handling setup completed");
        } catch (error) {
            logger.error("Error setting up navigation handling:", error);
        }
    }

    /**
     * Helper method to clear a ListBox
     */
    private clearListBox(listBox: Gtk.ListBox): void {
        if (!listBox) return;

        let child = listBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            listBox.remove(child);
            child = next;
        }
    }
}
