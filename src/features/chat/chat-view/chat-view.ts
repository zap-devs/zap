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
    private chats: Chat[] = [];
    private messages: Message[] = [];
    private listBox!: Gtk.ListBox;
    private welcomeContainer!: Gtk.Box;
    private welcomeScreen!: ChatWelcome | null;
    private userName: string = "";
    private userNameLabel!: GtkTypes.Label;
    private currentChatId: number | null = null;
    private breakpointBin!: Adw.BreakpointBin;
    private listBoxMobile!: GtkTypes.ListBox;
    private mobileNavigationView!: Adw.NavigationView;
    private chatContentPage!: Adw.NavigationPage;
    private backButton!: GtkTypes.Button;
    private chatPageTitle!: Adw.WindowTitle;
    private mobileWelcomeContainer!: GtkTypes.Box;
    private mobileChatContent!: ChatContent;

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
                    "breakpoint_bin",
                    "listBox_mobile",
                    "navigation_view",
                    "chat_list_page",
                    "chat_content_page",
                    "backButton",
                    "chatPageTitle",
                    "mobileWelcomeContainer",
                    "mobileChatContent",
                ],
            },
            ChatView,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();

        // Get the widgets from the template
        this.listBox = this.get_template_child(ChatView.$gtype, "listBox") as GtkTypes.ListBox;
        this.listBoxMobile = this.get_template_child(
            ChatView.$gtype,
            "listBox_mobile",
        ) as GtkTypes.ListBox;
        this.welcomeContainer = this.get_template_child(
            ChatView.$gtype,
            "welcomeContainer",
        ) as Gtk.Box;
        this.userNameLabel = this.get_template_child(
            ChatView.$gtype,
            "userNameLabel",
        ) as Gtk.Label;
        this.breakpointBin = this.get_template_child(
            ChatView.$gtype,
            "breakpoint_bin",
        ) as Adw.BreakpointBin;

        // Get navigation view - it's named "navigation_view" in the Blueprint
        try {
            this.mobileNavigationView = this.get_template_child(
                ChatView.$gtype,
                "navigation_view",
            ) as Adw.NavigationView;

            if (this.mobileNavigationView) {
                logger.info("Successfully got navigation view from template");
                logger.info(`Navigation view type: ${this.mobileNavigationView.constructor.name}`);
                logger.info(`Navigation view visible: ${this.mobileNavigationView.visible}`);
            } else {
                logger.error("Failed to get navigation view from template");
            }
        } catch (error) {
            logger.error("Error getting navigation view:", error);
        }

        // Try to get mobile navigation components with fallback names
        try {
            this.backButton = this.get_template_child(
                ChatView.$gtype,
                "backButton",
            ) as GtkTypes.Button;
        } catch (error) {
            logger.warn("backButton not found, trying mobileBackButton");
            try {
                this.backButton = this.get_template_child(
                    ChatView.$gtype,
                    "mobileBackButton",
                ) as GtkTypes.Button;
            } catch (error2) {
                logger.error("backButton and mobileBackButton not found:", error2);
            }
        }

        try {
            this.chatPageTitle = this.get_template_child(
                ChatView.$gtype,
                "chatPageTitle",
            ) as Adw.WindowTitle;
        } catch (error) {
            logger.warn("chatPageTitle not found, trying mobileChatPageTitle");
            try {
                this.chatPageTitle = this.get_template_child(
                    ChatView.$gtype,
                    "mobileChatPageTitle",
                ) as Adw.WindowTitle;
            } catch (error2) {
                logger.error("chatPageTitle and mobileChatPageTitle not found:", error2);
            }
        }

        try {
            this.mobileWelcomeContainer = this.get_template_child(
                ChatView.$gtype,
                "mobileWelcomeContainer",
            ) as GtkTypes.Box;
        } catch (error) {
            logger.warn("mobileWelcomeContainer not found, trying mobileChatWelcomeContainer");
            try {
                this.mobileWelcomeContainer = this.get_template_child(
                    ChatView.$gtype,
                    "mobileChatWelcomeContainer",
                ) as GtkTypes.Box;
            } catch (error2) {
                logger.error(
                    "mobileWelcomeContainer and mobileChatWelcomeContainer not found:",
                    error2,
                );
            }
        }

        try {
            this.mobileChatContent = this.get_template_child(
                ChatView.$gtype,
                "mobileChatContent",
            ) as ChatContent;
        } catch (error) {
            logger.warn("mobileChatContent not found, trying mobileChatContentWidget");
            try {
                this.mobileChatContent = this.get_template_child(
                    ChatView.$gtype,
                    "mobileChatContentWidget",
                ) as ChatContent;
            } catch (error2) {
                logger.error("mobileChatContent and mobileChatContentWidget not found:", error2);
            }
        }

        // Log all retrieved components for debugging
        logger.info("=== TEMPLATE CHILDREN RETRIEVAL RESULTS ===");
        logger.info(`listBox: ${!!this.listBox}`);
        logger.info(`listBoxMobile: ${!!this.listBoxMobile}`);
        logger.info(`welcomeContainer: ${!!this.welcomeContainer}`);
        logger.info(`userNameLabel: ${!!this.userNameLabel}`);
        logger.info(`breakpointBin: ${!!this.breakpointBin}`);
        logger.info(`mobileNavigationView: ${!!this.mobileNavigationView}`);
        logger.info(`backButton: ${!!this.backButton}`);
        logger.info(`chatPageTitle: ${!!this.chatPageTitle}`);
        logger.info(`mobileWelcomeContainer: ${!!this.mobileWelcomeContainer}`);
        logger.info(`mobileChatContent: ${!!this.mobileChatContent}`);

        logger.info("ChatView vfunc_constructed called");

        try {
            // Initialize data using services
            this.loadDataFromService();

            // Initialize the list model for chats
            this.initializeChatList();

            // Setup mobile navigation
            this.setupMobileNavigation();

            // Show the welcome screen by default (this will handle mobile vs desktop logic)
            this.showWelcomeScreen();

            // Double-check layout and force desktop welcome screen if needed
            if (!this.isMobileLayout()) {
                logger.info("Double-check: Ensuring desktop welcome screen is shown");
                this.showDesktopWelcomeScreen();
            }

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

            // Clear existing rows from both desktop and mobile list boxes
            this.clearListBox(this.listBox);
            this.clearListBox(this.listBoxMobile);

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
                    logger.info(`Desktop chat selected: ${chatData.name} (ID: ${chatData.id})`);

                    // Hide welcome container and show chat content
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                        logger.info(`Hidden welcome container for chat: ${chatData.name}`);
                    }

                    // Load and display messages for this chat (desktop)
                    this.currentChatId = chatData.id;
                    this.loadMessagesForChat(chatData.id);

                    logger.info(`Desktop chat selected and messages loaded: ${chatData.name}`);
                });

                // Add to desktop list box
                this.listBox.append(chatItem);

                // Create separate mobile chat item with proper mobile navigation
                const mobileChatItem = new ChatListItem();
                mobileChatItem.setChatData(chat);
                mobileChatItem.connect("activated", () => {
                    logger.info(`Mobile chat selected: ${chatData.name} (ID: ${chatData.id})`);

                    // Hide welcome containers
                    if (welcomeContainer) {
                        welcomeContainer.visible = false;
                    }

                    // Always navigate to chat content on mobile (this handles the mobile layout check internally)
                    this.navigateToChatContent(chatData);

                    // Set current chat ID but don't load messages here - let navigateToChatContent handle it
                    this.currentChatId = chatData.id;
                });
                this.listBoxMobile.append(mobileChatItem);
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

            // On desktop, hide welcome screen and show chat content
            if (!this.isMobileLayout()) {
                logger.info("Desktop layout - showing chat content, hiding welcome screen");

                // Hide welcome screen
                const welcomeContainer = this.get_template_child(
                    ChatView.$gtype,
                    "welcomeContainer",
                ) as Gtk.Box;
                if (welcomeContainer) {
                    welcomeContainer.visible = false;
                    logger.info("Hidden desktop welcome container");
                }

                // Show and load chat content
                const chatContent = this.get_template_child(
                    ChatView.$gtype,
                    "chatContent",
                ) as ChatContent;

                if (chatContent) {
                    chatContent.visible = true;
                    chatContent.loadMessages(chatId, this.messages);
                    logger.info("Desktop chat content loaded and shown");
                } else {
                    logger.error("Desktop ChatContent is null");
                }
            } else {
                // On mobile, messages are loaded via navigateToChatContent
                logger.info("Mobile layout - messages will be loaded via navigateToChatContent");
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
        logger.info(`=== SHOW WELCOME SCREEN ===`);

        // CRITICAL FIX: Retrieve ChatContent fresh to avoid context loss
        const chatContent = this.get_template_child(ChatView.$gtype, "chatContent") as ChatContent;
        logger.info(`ChatContent retrieved: ${!!chatContent}`);

        // Check if we're in mobile layout
        const isMobile = this.isMobileLayout();
        logger.info(`Is mobile layout: ${isMobile}`);

        if (isMobile) {
            logger.info("Mobile layout detected - hiding welcome screen, showing chat list");

            // On mobile, hide all content and show chat list
            if (chatContent) {
                chatContent.visible = false;
                logger.info("Hidden desktop chat content");
            }

            // Hide mobile chat content if it exists
            if (this.mobileChatContent) {
                this.mobileChatContent.visible = false;
                logger.info("Hidden mobile chat content");
            }

            // Ensure mobile welcome container is hidden
            if (this.mobileWelcomeContainer) {
                this.mobileWelcomeContainer.visible = false;
                logger.info("Hidden mobile welcome container");
            }

            // Hide desktop welcome container
            if (this.welcomeContainer) {
                this.welcomeContainer.visible = false;
                logger.info("Hidden desktop welcome container");
            }

            // On mobile, the chat list should be visible by default in navigation view
            logger.info("Mobile layout: welcome screen hidden, chat list should be visible");
            return;
        }

        // Desktop layout - show welcome screen
        logger.info("Desktop layout detected - showing welcome screen");

        // Hide chat content on desktop
        if (chatContent) {
            chatContent.visible = false;
            logger.info("Hidden desktop chat content");
        }

        // Hide mobile components on desktop
        if (this.mobileChatContent) {
            this.mobileChatContent.visible = false;
            logger.info("Hidden mobile chat content on desktop");
        }
        if (this.mobileWelcomeContainer) {
            this.mobileWelcomeContainer.visible = false;
            logger.info("Hidden mobile welcome container on desktop");
        }

        // Show desktop welcome screen
        if (this.welcomeContainer) {
            logger.info("Setting up desktop welcome screen");

            // Create and show the welcome screen
            if (!this.welcomeScreen) {
                this.welcomeScreen = new ChatWelcome();
                logger.info("Created new ChatWelcome instance");
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
            logger.info("Desktop welcome screen shown successfully");
        } else {
            logger.error("welcomeContainer is null - cannot show welcome screen");
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

    /**
     * Helper method to clear a ListBox
     */
    private clearListBox(listBox: any): void {
        if (!listBox) return;

        let child = listBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            listBox.remove(child);
            child = next;
        }
    }

    /**
     * Check if currently in mobile layout
     */
    private isMobileLayout(): boolean {
        logger.info(`=== MOBILE LAYOUT CHECK ===`);

        // CRITICAL FIX: Retrieve breakpoint bin fresh each time to avoid context loss
        let breakpointBin: Adw.BreakpointBin | null = null;
        try {
            breakpointBin = this.get_template_child(
                ChatView.$gtype,
                "breakpoint_bin",
            ) as Adw.BreakpointBin;
            logger.info(`Fresh breakpoint bin retrieved: ${!!breakpointBin}`);
        } catch (error) {
            logger.error(`Error retrieving fresh breakpoint bin:`, error);
            breakpointBin = this.breakpointBin; // fallback
        }

        // Primary check: check what child is currently shown in breakpoint bin
        if (breakpointBin) {
            try {
                const currentChild = breakpointBin.child;
                logger.info(
                    `Breakpoint bin current child type: ${currentChild?.constructor.name}`,
                );

                // Check if the current child is the navigation view (mobile mode)
                if (currentChild && currentChild.constructor.name === "NavigationView") {
                    logger.info("Mobile layout detected - breakpoint bin shows navigation view");
                    return true;
                }

                // Check if the current child is the desktop layout (Box with orientation)
                if (currentChild && currentChild.constructor.name === "Box") {
                    // Check if it's the desktop layout by looking for split_view or desktop_layout characteristics
                    const boxChild = currentChild as Gtk.Box;
                    logger.info(`Box child found, checking for desktop characteristics`);

                    // Look for split_view in the children (desktop layout indicator)
                    let hasSplitView = false;
                    let child = boxChild.get_first_child();
                    while (child) {
                        if (child.constructor.name === "NavigationSplitView") {
                            hasSplitView = true;
                            break;
                        }
                        child = child.get_next_sibling();
                    }

                    if (hasSplitView) {
                        logger.info(
                            "Desktop layout detected - breakpoint bin shows desktop layout with split view",
                        );
                        return false;
                    }
                }
            } catch (error) {
                logger.error(`Error checking breakpoint bin child:`, error);
            }
        }

        // Secondary check: check stored breakpoint bin (fallback only if fresh failed)
        if (this.breakpointBin && !breakpointBin) {
            try {
                const currentChild = this.breakpointBin.child;
                logger.info(
                    `Stored breakpoint bin current child: ${currentChild?.constructor.name}`,
                );

                // Check if the current child is the navigation view (mobile mode)
                if (currentChild && currentChild.constructor.name === "NavigationView") {
                    logger.info("Mobile layout detected - stored breakpoint bin shows navigation");
                    return true;
                }

                // Check if it's the desktop layout (Box with split view)
                if (currentChild && currentChild.constructor.name === "Box") {
                    const boxChild = currentChild as Gtk.Box;
                    let hasSplitView = false;
                    let child = boxChild.get_first_child();
                    while (child) {
                        if (child.constructor.name === "NavigationSplitView") {
                            hasSplitView = true;
                            break;
                        }
                        child = child.get_next_sibling();
                    }

                    if (hasSplitView) {
                        logger.info(
                            "Desktop layout detected - stored breakpoint bin shows desktop layout",
                        );
                        return false;
                    }
                }
            } catch (error) {
                logger.error(`Error checking stored breakpoint bin:`, error);
            }
        }

        // NO FALLBACK TO NAVIGATION VIEW - this was causing false positives
        // If we can't determine the layout, assume desktop (safer default)
        logger.info("Mobile layout check inconclusive - assuming desktop (no fallback)");
        return false;
    }

    /**
     * Setup mobile navigation handlers
     */
    private setupMobileNavigation(): void {
        if (this.backButton) {
            this.backButton.connect("clicked", () => {
                logger.info("Mobile back button clicked");

                // CRITICAL: Retrieve fresh navigation view to avoid context loss
                let navView: Adw.NavigationView | null = null;
                try {
                    navView = this.get_template_child(
                        ChatView.$gtype,
                        "navigation_view",
                    ) as Adw.NavigationView;
                } catch (error) {
                    logger.error(`Error retrieving fresh navigation view for back button:`, error);
                    navView = this.mobileNavigationView; // fallback
                }

                if (navView) {
                    navView.pop();
                    logger.info("Mobile navigation popped");

                    // After popping, we should be back at chat list
                    // Reset current chat ID since we're no longer in a chat
                    this.currentChatId = null;

                    // Hide mobile chat content
                    if (this.mobileChatContent) {
                        this.mobileChatContent.visible = false;
                    }

                    logger.info("Mobile navigation back to chat list completed");
                } else {
                    logger.error("No navigation view available for back button");
                }
            });
        }
    }

    /**
     * Navigate to chat content on mobile
     */
    private navigateToChatContent(chatData: Chat): void {
        logger.info(`=== MOBILE NAVIGATION ATTEMPT ===`);
        logger.info(
            `Navigating to mobile chat content for: ${chatData.name} (ID: ${chatData.id})`,
        );

        // CRITICAL FIX: Retrieve navigation view fresh each time to avoid context loss
        let navView: Adw.NavigationView | null = null;
        try {
            navView = this.get_template_child(
                ChatView.$gtype,
                "navigation_view",
            ) as Adw.NavigationView;
            logger.info(`Fresh navigation view retrieved: ${!!navView}`);
        } catch (error) {
            logger.error(`Error retrieving fresh navigation view:`, error);
        }

        if (!navView) {
            logger.error("Cannot navigate - fresh navigation view is null");
            return;
        }

        try {
            // Hide mobile welcome container if it exists
            if (this.mobileWelcomeContainer) {
                this.mobileWelcomeContainer.visible = false;
                logger.info(`Hidden mobile welcome container`);
            }

            // Debug fresh navigation view state
            logger.info(`Fresh navigation view visible: ${navView.visible}`);
            logger.info(`Fresh navigation view type: ${navView.constructor.name}`);

            // First, ensure we're in mobile layout by making navigation visible
            if (!navView.visible) {
                logger.info("Making fresh navigation view visible for mobile layout");
                navView.visible = true;
            }

            // Update our stored reference
            this.mobileNavigationView = navView;

            // Navigate to the chat content page
            logger.info(`Pushing navigation page with tag: chat_content_page`);
            navView.push_by_tag("chat_content_page");
            logger.info(`Mobile navigation pushed by tag for chat: ${chatData.name}`);

            // Update page title if available
            if (this.chatPageTitle) {
                this.chatPageTitle.title = chatData.name;
                logger.info(`Updated page title to: ${chatData.name}`);
            }

            // Load messages into the mobile chat content
            this.loadMessagesIntoMobileChatContent(chatData);

            // Hide desktop chat content since we're on mobile
            const desktopChatContent = this.get_template_child(
                ChatView.$gtype,
                "chatContent",
            ) as ChatContent;
            if (desktopChatContent) {
                desktopChatContent.visible = false;
            }

            logger.info(`Mobile navigation completed for chat: ${chatData.name}`);
        } catch (error) {
            logger.error(`Error pushing navigation page by tag:`, error);
            logger.error(`Fresh navigation view available: ${!!navView}`);
            logger.error(`Page title available: ${!!this.chatPageTitle}`);
            logger.error(`Mobile chat content available: ${!!this.mobileChatContent}`);

            // Try alternative navigation methods
            try {
                // Try navigating by page object instead of tag
                if (this.chatContentPage) {
                    navView.push(this.chatContentPage);
                    logger.info(
                        `Mobile navigation pushed by page object for chat: ${chatData.name}`,
                    );

                    // Still try to load messages even with alternative navigation
                    this.loadMessagesIntoMobileChatContent(chatData);
                }
            } catch (altError) {
                logger.error(`Alternative navigation also failed:`, altError);
            }
        }
    }

    /**
     * Load messages into mobile chat content with proper error handling
     */
    private loadMessagesIntoMobileChatContent(chatData: Chat): void {
        const chatMessages = this.getMessagesForChat(chatData.id);

        if (this.mobileChatContent) {
            // CRITICAL: Ensure template children are available before loading messages
            if (typeof (this.mobileChatContent as any).ensureTemplateChildren === "function") {
                (this.mobileChatContent as any).ensureTemplateChildren();
            }

            this.mobileChatContent.loadMessages(chatData.id, chatMessages);
            this.mobileChatContent.visible = true;
            logger.info(`Loaded messages for chat ${chatData.id} into mobile content`);
        } else {
            logger.error(`mobileChatContent is null, attempting fresh retrieval`);

            // Try to retrieve fresh mobile chat content
            try {
                const freshMobileChatContent = this.get_template_child(
                    ChatView.$gtype,
                    "mobileChatContent",
                ) as ChatContent;

                if (freshMobileChatContent) {
                    // Ensure template children are available
                    if (
                        typeof (freshMobileChatContent as any).ensureTemplateChildren ===
                        "function"
                    ) {
                        (freshMobileChatContent as any).ensureTemplateChildren();
                    }

                    freshMobileChatContent.loadMessages(chatData.id, chatMessages);
                    freshMobileChatContent.visible = true;
                    this.mobileChatContent = freshMobileChatContent;
                    logger.info(`Retrieved fresh mobileChatContent and loaded messages`);
                } else {
                    logger.error(`Fresh mobileChatContent retrieval also failed`);
                }
            } catch (error) {
                logger.error(`Failed to retrieve fresh mobileChatContent:`, error);
            }
        }
    }

    /**
     * Get messages for a specific chat
     */
    private getMessagesForChat(chatId: number): Message[] {
        // For now, return the same mock messages
        // In a real app, this would fetch from service
        return [
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
        ];
    }

    /**
     * Explicitly show desktop welcome screen (for desktop layout only)
     */
    private showDesktopWelcomeScreen(): void {
        logger.info("=== SHOW DESKTOP WELCOME SCREEN ===");

        // Hide chat content
        const chatContent = this.get_template_child(ChatView.$gtype, "chatContent") as ChatContent;
        if (chatContent) {
            chatContent.visible = false;
            logger.info("Hidden desktop chat content");
        }

        // Show desktop welcome screen
        if (this.welcomeContainer) {
            logger.info("Setting up desktop welcome screen");

            // Create and show the welcome screen
            if (!this.welcomeScreen) {
                this.welcomeScreen = new ChatWelcome();
                logger.info("Created new ChatWelcome instance");
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
            logger.info("Desktop welcome screen shown successfully");
        } else {
            logger.error("welcomeContainer is null - cannot show desktop welcome screen");
        }
    }
}
