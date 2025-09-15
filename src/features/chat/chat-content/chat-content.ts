import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Message } from "../../../shared/models/chat.model.js";

export class ChatContent extends Adw.Bin {
    protected declare _messageContainer: Gtk.Box;
    protected declare _messageEntry: Gtk.Entry;
    protected declare _sendButton: Gtk.Button;
    private messages: Message[] = [];
    private currentChatId: number | null = null;

    static {
        GObject.registerClass(
            {
                Template:
                    "resource:///sh/alisson/Zap/ui/features/chat/chat-content/chat-content.ui",
                InternalChildren: ["messageContainer", "messageEntry", "sendButton"],
            },
            ChatContent,
        );
    }

    /**
     * Load and display messages for a specific chat
     */
    public loadMessages(chatId: number, messages: Message[]): void {
        try {
            logger.info(`Loading ${messages.length} messages for chat ${chatId}`);

            this.currentChatId = chatId;
            this.messages = messages;

            // Clear the message container
            let child = this._messageContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                this._messageContainer.remove(child);
                child = next;
            }

            // Add messages to the container
            logger.debug(`Adding ${messages.length} messages to container`);
            for (const message of messages) {
                logger.debug(`Creating widget for message: ${message.text}`);
                const messageWidget = this.createMessageWidget(message);
                this._messageContainer.append(messageWidget);
                logger.debug(`Message widget appended to container`);
            }

            // Scroll to bottom
            const scrolledWindow = this._messageContainer.get_parent() as Gtk.ScrolledWindow;
            if (scrolledWindow) {
                const vadjustment = scrolledWindow.get_vadjustment();
                if (vadjustment) {
                    // Use a small delay to ensure the layout is updated
                    setTimeout(() => {
                        vadjustment.set_value(vadjustment.get_upper());
                    }, 100);
                }
            }

            logger.info(`Messages loaded and displayed for chat ${chatId}`);
        } catch (error) {
            logger.error(`Error loading messages for chat ${chatId}:`, error);
        }
    }

    /**
     * Add a new message to the chat
     */
    public addMessage(message: Message): void {
        try {
            if (message.chatId !== this.currentChatId) {
                logger.warn(
                    `Message chatId ${message.chatId} doesn't match current chat ${this.currentChatId}`,
                );
                return;
            }

            if (!this._messageContainer) {
                logger.error("Message container is null, cannot add message");
                return;
            }

            this.messages.push(message);
            const messageWidget = this.createMessageWidget(message);
            this._messageContainer.append(messageWidget);

            // Scroll to bottom
            const scrolledWindow = this._messageContainer.get_parent() as Gtk.ScrolledWindow;
            if (scrolledWindow) {
                const vadjustment = scrolledWindow.get_vadjustment();
                if (vadjustment) {
                    setTimeout(() => {
                        vadjustment.set_value(vadjustment.get_upper());
                    }, 100);
                }
            }
        } catch (error) {
            logger.error("Error adding message:", error);
        }
    }

    /**
     * Clear the current chat content
     */
    public clearMessages(): void {
        try {
            this.currentChatId = null;
            this.messages = [];

            if (!this._messageContainer) {
                logger.warn("Message container is null, skipping clear");
                return;
            }

            // Clear the message container
            let child = this._messageContainer.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                this._messageContainer.remove(child);
                child = next;
            }

            logger.info("Chat content cleared");
        } catch (error) {
            logger.error("Error clearing messages:", error);
        }
    }

    /**
     * Get the message entry widget
     */
    public getMessageEntry(): Gtk.Entry {
        return this._messageEntry;
    }

    /**
     * Get the current chat ID
     */
    public getCurrentChatId(): number | null {
        return this.currentChatId;
    }

    private createMessageWidget(message: Message): Gtk.Widget {
        logger.debug(`Creating message widget for: ${message.text}`);

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

        logger.debug(`Message widget created successfully`);

        return messageBox;
    }
}
