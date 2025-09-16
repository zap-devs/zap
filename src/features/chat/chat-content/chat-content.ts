import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";

import { logger } from "~/core/logger.js";
import { MessageBubble } from "~/features/chat/components/message-bubble/message-bubble.js";
import type { Message } from "~/shared/models/chat.model.js";

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
        logger.debug(`Creating message bubble for: ${message.text.substring(0, 30)}...`);

        // Create reusable MessageBubble component
        const messageBubble = new MessageBubble();
        messageBubble.setMessageData(message);

        return messageBubble;
    }
}
