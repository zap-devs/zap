import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject?version=2.0";

export class WelcomePage extends Adw.Bin {
    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/welcome.ui",
            },
            WelcomePage,
        );
    }
}
