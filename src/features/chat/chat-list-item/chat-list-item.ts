import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";
import { logger } from "../../../core/logger.js";
import type { Chat } from "../../../shared/models/chat.model.js";

export class ChatListItem extends Adw.ActionRow {
    private chatData: Chat | null = null;

    static {
        GObject.registerClass(
            {
                Template:
                    "resource:///sh/alisson/Zap/ui/features/chat/chat-list-item/chat-list-item.ui",
                InternalChildren: ["chatAvatar", "chatMetaBox", "unreadBadge", "timestampLabel"],
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

        // CRITICAL FIX: Retrieve template children fresh to avoid context loss
        const chatAvatar = this.get_template_child(
            ChatListItem.$gtype,
            "chatAvatar",
        ) as Adw.Avatar;
        const timestampLabel = this.get_template_child(
            ChatListItem.$gtype,
            "timestampLabel",
        ) as Gtk.Label;
        const unreadBadge = this.get_template_child(
            ChatListItem.$gtype,
            "unreadBadge",
        ) as Gtk.Label;

        logger.debug(
            `[ChatListItem] Setting chat data for ${chat.name}, unread: ${chat.unreadCount}, time: ${chat.timestamp}`,
        );

        // Set the main title and subtitle
        this.title = chat.name;
        this.subtitle = chat.lastMessage;

        // Set avatar
        if (chatAvatar) {
            chatAvatar.text = chat.name;
            logger.debug(`[ChatListItem] Avatar text set to: ${chat.name}`);
        } else {
            logger.error("[ChatListItem] chatAvatar is undefined in setChatData");
        }

        // Set timestamp
        if (timestampLabel) {
            timestampLabel.label = chat.timestamp;
            logger.debug(`[ChatListItem] Timestamp label set to: ${chat.timestamp}`);
        } else {
            logger.error("[ChatListItem] timestampLabel is undefined in setChatData");
        }

        // Show/hide unread badge
        if (unreadBadge) {
            if (chat.unreadCount > 0) {
                unreadBadge.visible = true;
                unreadBadge.label = chat.unreadCount.toString();
                logger.debug(`[ChatListItem] Unread badge shown with count: ${chat.unreadCount}`);
            } else {
                unreadBadge.visible = false;
                logger.debug("[ChatListItem] Unread badge hidden");
            }
        } else {
            logger.error("[ChatListItem] unreadBadge is undefined in setChatData");
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

            // CRITICAL FIX: Retrieve template children fresh to avoid context loss
            const unreadBadge = this.get_template_child(
                ChatListItem.$gtype,
                "unreadBadge",
            ) as Gtk.Label;

            if (unreadBadge) {
                if (count > 0) {
                    unreadBadge.visible = true;
                    unreadBadge.label = count.toString();
                } else {
                    unreadBadge.visible = false;
                }
            } else {
                logger.error("[ChatListItem] unreadBadge is undefined in updateUnreadCount");
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

            // CRITICAL FIX: Retrieve template children fresh to avoid context loss
            const timestampLabel = this.get_template_child(
                ChatListItem.$gtype,
                "timestampLabel",
            ) as Gtk.Label;

            if (timestampLabel) {
                timestampLabel.label = timestamp;
            } else {
                logger.error("[ChatListItem] timestampLabel is undefined in updateLastMessage");
            }
        }
    }
}
