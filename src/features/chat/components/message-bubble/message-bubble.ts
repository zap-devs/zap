import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import Gtk from "gi://Gtk?version=4.0";

import { logger } from "~/core/logger.js";
import type { Message } from "~/shared/models/chat.model.js";
import { MessageStatus } from "~/shared/models/chat.model.js";

export class MessageBubble extends Adw.Bin {
    protected declare _messageText: Gtk.Label;
    protected declare _timestampLabel: Gtk.Label;
    protected declare _statusIcon: Gtk.Image;
    protected declare _bubbleContainer: Gtk.Box;

    private messageData: Message | null = null;

    static {
        GObject.registerClass(
            {
                Template:
                    "resource:///sh/alisson/Zap/ui/features/chat/components/message-bubble/message-bubble.ui",
                InternalChildren: [
                    "messageText",
                    "timestampLabel",
                    "statusIcon",
                    "bubbleContainer",
                ],
            },
            MessageBubble,
        );
    }

    /**
     * Set the message data for this bubble
     */
    public setMessageData(message: Message): void {
        this.messageData = message;

        logger.debug(`[MessageBubble] Setting message: ${message.text.substring(0, 30)}...`);

        // Set message text
        this._messageText.label = message.text;

        // Set timestamp
        this._timestampLabel.label = message.timestamp;

        // Set alignment based on ownership
        if (message.isOwn) {
            this._bubbleContainer.halign = Gtk.Align.END;
            this._bubbleContainer.add_css_class("own-message");
            this._bubbleContainer.remove_css_class("other-message");

            // Show status icon for own messages
            this._statusIcon.visible = true;
            this.updateStatusIcon(message.status);
        } else {
            this._bubbleContainer.halign = Gtk.Align.START;
            this._bubbleContainer.add_css_class("other-message");
            this._bubbleContainer.remove_css_class("own-message");

            // Hide status icon for other messages
            this._statusIcon.visible = false;
        }

        logger.debug(
            `[MessageBubble] Message bubble configured for ${message.isOwn ? "own" : "other"} message`,
        );
    }

    /**
     * Update the message status
     */
    public updateStatus(status: MessageStatus): void {
        if (this.messageData) {
            this.messageData.status = status;
            this.updateStatusIcon(status);
        }
    }

    /**
     * Update the status icon based on message status
     */
    private updateStatusIcon(status?: MessageStatus): void {
        if (!this.messageData?.isOwn) {
            return;
        }

        switch (status) {
            case MessageStatus.SENT:
                this._statusIcon.icon_name = "emblem-default-symbolic";
                this._statusIcon.tooltip_text = "Sent";
                break;
            case MessageStatus.DELIVERED:
                this._statusIcon.icon_name = "emblem-ok-symbolic";
                this._statusIcon.tooltip_text = "Delivered";
                break;
            case MessageStatus.READ:
                this._statusIcon.icon_name = "emblem-read-symbolic";
                this._statusIcon.tooltip_text = "Read";
                break;
            case MessageStatus.FAILED:
                this._statusIcon.icon_name = "dialog-error-symbolic";
                this._statusIcon.tooltip_text = "Failed to send";
                break;
            default:
                this._statusIcon.icon_name = "emblem-synchronizing-symbolic";
                this._statusIcon.tooltip_text = "Sending...";
                break;
        }
    }

    /**
     * Get the message data associated with this bubble
     */
    public getMessageData(): Message | null {
        return this.messageData;
    }

    /**
     * Clear the message data
     */
    public clear(): void {
        this.messageData = null;
        this._messageText.label = "";
        this._timestampLabel.label = "";
        this._statusIcon.visible = false;
        this._bubbleContainer.remove_css_class("own-message");
        this._bubbleContainer.remove_css_class("other-message");
    }

    /**
     * Focus the message bubble (for accessibility)
     */
    public focusBubble(): void {
        this._bubbleContainer.grab_focus();
    }
}
