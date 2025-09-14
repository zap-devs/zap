import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";
import type Gtk from "gi://Gtk?version=4.0";

export class LoginPage extends Adw.Bin {
    private phoneEntry!: Gtk.Entry;

    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/login.ui",
                InternalChildren: ["phoneEntry"],
            },
            LoginPage,
        );
    }

    public vfunc_constructed(): void {
        super.vfunc_constructed();
        try {
            this.phoneEntry = this.get_template_child(LoginPage.$gtype, "phoneEntry") as Gtk.Entry;
        } catch (error) {
            console.error("Failed to get phoneEntry template child:", error);
        }
    }

    public getPhoneNumber(): string {
        if (this.phoneEntry) {
            return this.phoneEntry.get_text();
        }
        return "";
    }
}
