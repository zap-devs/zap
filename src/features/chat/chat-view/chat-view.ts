import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Chat, Message } from "../../../shared/models/chat.model.js";
import type { ChatContent } from "../chat-content/chat-content.js";
import { ChatListItem } from "../chat-list-item/chat-list-item.js";
import { ChatWelcome } from "../chat-welcome/chat-welcome.js";

export class ChatView extends Adw.Bin {
    private chats: Chat[] = [];
    private messages: Message[] = [];
    private listBox!: Gtk.ListBox;
    private welcomeContainer!: Gtk.Box;
    private welcomeScreen!: ChatWelcome | null;
    private userName: string = "";
    private userNameLabel!: Gtk.Label;
    private currentChatId: number | null = null;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/features/chat/chat-view/chat-view.ui",
                InternalChildren: [
                    "listBox",
                    "contentBox",
                    "welcomeContainer",
                    "split_view",
                    "userNameLabel",
                    "chatContent",
                ],
            },
            ChatView,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();

        // Get the widgets from the template
        this.listBox = this.get_template_child(ChatView.$gtype, "listBox") as Gtk.ListBox;
        this.welcomeContainer = this.get_template_child(
            ChatView.$gtype,
            "welcomeContainer",
        ) as Gtk.Box;
        this.userNameLabel = this.get_template_child(
            ChatView.$gtype,
            "userNameLabel",
        ) as Gtk.Label;

        logger.info("ChatView vfunc_constructed called");

        try {
            // Initialize data using services
            this.loadDataFromService();

            // Initialize the list model for chats
            this.initializeChatList();

            // Show the welcome screen by default
            this.showWelcomeScreen();

            logger.info("ChatView constructed successfully");
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

            // Create ChatListItem components for each chat
            const chats = this.chats; // Store reference to avoid closure issues
            for (let i = 0; i < chats.length; i++) {
                const chat = chats[i];

                // Create ChatListItem for each chat
                const chatItem = new ChatListItem();
                chatItem.setChatData(chat);

                // Store chat data and all necessary references in the closure
                const chatData = chat; // Store the actual chat data
                const welcomeContainer = this.welcomeContainer;

                // Connect to row activation
                chatItem.connect("activated", () => {
                    logger.info(`Chat selected: ${chatData.name} (ID: ${chatData.id})`);

                    // Hide welcome container and show chat content
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                    }

                    // Load and display messages for this chat
                    this.currentChatId = chatData.id;
                    this.loadMessagesForChat(chatData.id);
                });

                this.listBox.append(chatItem);
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

            // CRITICAL FIX: Retrieve ChatContent fresh in action callback to avoid context loss
            const chatContent = this.get_template_child(
                ChatView.$gtype,
                "chatContent",
            ) as ChatContent;
            logger.debug(`Retrieved ChatContent fresh: ${!!chatContent}`);

            if (chatContent) {
                logger.debug(`Calling loadMessages with ${this.messages.length} messages`);
                chatContent.visible = true;
                chatContent.loadMessages(chatId, this.messages);
                logger.debug(`loadMessages call completed`);
            } else {
                logger.error(`ChatContent is null, cannot load messages`);
            }
        } catch (error) {
            logger.error(`Error loading messages for chat ${chatId}:`, error);
            this.messages = [];

            // Try to retrieve ChatContent fresh for clearing messages
            const chatContent = this.get_template_child(
                ChatView.$gtype,
                "chatContent",
            ) as ChatContent;
            if (chatContent) {
                chatContent.clearMessages();
            }
        }
    }

    private showWelcomeScreen(): void {
        // CRITICAL FIX: Retrieve ChatContent fresh to avoid context loss
        const chatContent = this.get_template_child(ChatView.$gtype, "chatContent") as ChatContent;
        if (chatContent) {
            chatContent.visible = false;
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
