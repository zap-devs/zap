import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Chat } from "../../../shared/models/chat.model.js";

export class ChatListItem extends Adw.ActionRow {
    protected declare _chatAvatar: Adw.Avatar;
    protected declare _unreadBadge: Gtk.Label;
    protected declare _timestampLabel: Gtk.Label;

    private chatData: Chat | null = null;

    static {
        GObject.registerClass(
            {
                Template:
                    "resource:///sh/alisson/Zap/ui/features/chat/chat-list-item/chat-list-item.ui",
                InternalChildren: ["chatAvatar", "unreadBadge", "timestampLabel"],
            },
            ChatListItem,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();
        logger.debug("[ChatListItem] vfunc_constructed called");
    }

    /**
     * Set the chat data for this list item
     */
    public setChatData(chat: Chat): void {
        this.chatData = chat;

        logger.debug(
            `[ChatListItem] Setting chat data for ${chat.name}, unread: ${chat.unreadCount}, time: ${chat.timestamp}`,
        );

        // Set the main title and subtitle
        this.title = chat.name;
        this.subtitle = chat.lastMessage;

        // Set avatar
        this._chatAvatar.text = chat.name;

        // Set timestamp
        this._timestampLabel.label = chat.timestamp;

        // Show/hide unread badge
        if (chat.unreadCount > 0) {
            this._unreadBadge.visible = true;
            this._unreadBadge.label = chat.unreadCount.toString();
            logger.debug(`[ChatListItem] Unread badge shown with count: ${chat.unreadCount}`);
        } else {
            this._unreadBadge.visible = false;
            logger.debug("[ChatListItem] Unread badge hidden");
        }
    }

    /**
     * Get the chat data associated with this item
     */
    public getChatData(): Chat | null {
        return this.chatData;
    }

    /**
     * Update the unread count
     */
    public updateUnreadCount(count: number): void {
        if (this.chatData) {
            this.chatData.unreadCount = count;

            if (count > 0) {
                this._unreadBadge.visible = true;
                this._unreadBadge.label = count.toString();
            } else {
                this._unreadBadge.visible = false;
            }
        }
    }

    /**
     * Update the last message and timestamp
     */
    public updateLastMessage(message: string, timestamp: string): void {
        if (this.chatData) {
            this.chatData.lastMessage = message;
            this.chatData.timestamp = timestamp;

            this.subtitle = message;

            this._timestampLabel.label = timestamp;
        }
    }
}
