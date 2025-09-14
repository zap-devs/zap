# AGENTS.md - AI Coding Agent Instructions for Zap

## Project Overview

Zap is a GTK 4/libadwaita desktop application written in TypeScript that provides a WhatsApp-style chat interface. It uses GJS (GNOME JavaScript) runtime with GObject introspection bindings and Flatpak for distribution.

## Tech Stack

- **Language**: TypeScript (compiled to JavaScript for GJS)
- **UI Framework**: GTK 4 + libadwaita 1.x with Blueprint markup (.blp files)
- **Runtime**: GJS (GNOME JavaScript) with GObject introspection
- **Build System**: Meson + Blueprint compiler + TypeScript compiler
- **Package Manager**: Bun (for TypeScript tooling only)
- **Distribution**: Flatpak
- **GLib/GObject**: Core object system (interfaces, signals, properties)

## Development Environment Setup

### Prerequisites
- Bun (for TypeScript compilation and tooling)
- Meson build system (>= 0.62.0)
- Blueprint compiler (`blueprint-compiler`)
- Flatpak development tools
- GTK 4 and libadwaita development libraries
- GJS (>= 1.54.0)

### Initial Setup
```bash
# Install TypeScript dependencies and type definitions
bun install

# Configure and build with Meson
meson setup builddir
meson compile -C builddir

# Build Flatpak package locally
flatpak-builder --user --install --force-clean build-aux/flatpak/sh.alisson.Zap.json
```

## Build Commands

### Development Build
```bash
# Configure debug build
meson setup builddir --buildtype=debug

# Compile TypeScript and Blueprint files
meson compile -C builddir

# Run the application in development mode
meson devenv -C builddir ninja devel
```

### Production Build
```bash
# Configure optimized build
meson setup builddir --buildtype=release

# Compile everything
meson compile -C builddir

# Build Flatpak package
flatpak-builder --repo=repo build-aux/flatpak/sh.alisson.Zap.json
```

### TypeScript Compilation Only
```bash
# Type check without emitting files
bun run tsc --strict --noEmit

# Build TypeScript files to JavaScript
bun run tsc --strict
```

## Critical GTK/libadwaita Patterns

### GObject Registration Pattern
```typescript
export class MyWidget extends Adw.Bin {
    static {
        GObject.registerClass(
            {
                Template: "resource:///sh/alisson/Zap/ui/my-widget.ui",
                InternalChildren: ["childWidget"], // Must match Blueprint template
            },
            MyWidget,
        );
    }
}
```

### Template Child Access Pattern
```typescript
// CORRECT: Use get_template_child with proper typing
private childWidget!: Gtk.Widget; // Declaration with ! to tell TypeScript it exists

public vfunc_constructed(): void {
    super.vfunc_constructed();
    this.childWidget = this.get_template_child(MyWidget.$gtype, "childWidget") as Gtk.Widget;
}
```

### Action System Pattern
```typescript
// Application-level actions (prefixed with "app.")
const quitAction = new Gio.SimpleAction({ name: "quit" });
this.add_action(quitAction);
this.set_accels_for_action("app.quit", ["<Control>q"]);

// Window-level actions (prefixed with "win.")
const myAction = new Gio.SimpleAction({ name: "my-action" });
this.add_action(myAction);
```

### Menu Integration Pattern
```typescript
// In Blueprint (.blp) file:
menu primary_menu {
  section {
    item {
      label: _("_Settings");
      action: "win.settings"; // References window action
    }
  }
}

// In TypeScript:
const settingsAction = new Gio.SimpleAction({ name: "settings" });
this.add_action(settingsAction);
```

## Critical GTK/libadwaita Mistakes to Avoid

### 1. Missing GObject Registration
```typescript
// WRONG: No static registration block
export class MyWidget extends Adw.Bin {}

// CORRECT: Must register with GObject system
export class MyWidget extends Adw.Bin {
    static {
        GObject.registerClass(MyWidget);
    }
}
```

### 2. Incorrect Template Child Declaration
```typescript
// WRONG: Missing ! or wrong name
private childWidget: Gtk.Widget; // TypeScript will complain

// CORRECT: Use ! to tell TypeScript it exists, match Blueprint name
private childWidget!: Gtk.Widget;
```

### 3. Wrong Action Prefix
```typescript
// WRONG: Mixing app and win prefixes
this.add_action(appAction);
this.set_accels_for_action("win.app-action", ["<Control>a"]);

// CORRECT: Match the widget level
// For Application class: use "app." prefix
// For Window/ApplicationWindow: use "win." prefix
```

### 4. Missing Virtual Function Override Syntax
```typescript
// WRONG: Regular method name
public constructed(): void {}

// CORRECT: vfunc_ prefix for virtual functions
public vfunc_constructed(): void {}
```

### 5. Incorrect Resource Paths
```typescript
// WRONG: Wrong resource path format
Template: "ui/my-widget.ui"

// CORRECT: Full resource path matching gresource.xml
Template: "resource:///sh/alisson/Zap/ui/my-widget.ui"
```

### 6. Missing Type Imports
```typescript
// WRONG: Missing type imports
import Gtk from "gi://Gtk?version=4.0";

// CORRECT: Import specific types for better TypeScript support
import type Gtk from "gi://Gtk?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
```

### 7. CSS Variables and Color Usage
```typescript
// PREFERRED: Use CSS variables instead of old GTK named colors
// Old GTK syntax: @accent_bg_color, @view_bg_color, etc.
// New CSS variables syntax: var(--accent-bg-color), var(--view-bg-color), etc.

// CORRECT: Use CSS variables for colors
.message-bubble {
  background-color: var(--accent-bg-color);
  color: var(--accent-fg-color);
}

// WRONG: Don't use old GTK named color syntax
.message-bubble {
  background-color: @accent_bg_color;  // ❌ Old syntax, deprecated
  color: @accent_fg_color;             // ❌ Old syntax, deprecated
}

// NOTE: Some CSS linting errors are false-positives and should be ignored
// since GTK's CSS implementation is not exactly the same as web CSS.
// Only fix CSS errors that actually break the GTK styling.
```

### 8. JavaScript Context Loss in GJS Action Callbacks (CRITICAL)
```typescript
// WRONG: Relying on cached this._stack reference in action callbacks
this.showLoginAction.connect("activate", () => {
    this._stack.visible_child_name = "login"; // this._stack may be undefined!
});

// CORRECT: Retrieve template children fresh in each action callback
this.showLoginAction.connect("activate", () => {
    const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
    if (stack) {
        stack.visible_child_name = "login";
    }
});

// CRITICAL INSIGHT: GJS action callbacks can lose context, causing 'this' references
// to become undefined. Always retrieve template children fresh in action callbacks.
```

## Code Style and Conventions

### TypeScript
- Use strict TypeScript configuration with explicit types
- Import both type and runtime versions of GTK modules
- Use `!` for template children that GJS will inject
- Prefer explicit typing over `any`
- Use `void` for functions that don't return values

### GTK/Blueprint
- Use libadwaita widgets (Adw.*) over plain GTK when available
- Follow GNOME HIG (Human Interface Guidelines)
- Use symbolic icon names (e.g., `"open-menu-symbolic"`)
- Keep UI definitions separate in .blp files
- Use CSS classes for styling, avoid inline styles

### File Organization
- **Core** (`src/core/`) - Core application components (window, logger)
- **Features** (`src/features/`) - Feature-specific modules organized by domain:
  - `auth/` - Authentication features (login, welcome)
  - `chat/` - Chat features (chat-view, chat-welcome)
- **Shared** (`src/shared/`) - Shared utilities, models, and services
- **Resources** (`src/resources/`) - Resource files (styles, gresource.xml, help-overlay)
- **Types** (`src/types/`) - TypeScript type definitions
- **Infrastructure** (`src/infrastructure/`) - Infrastructure components (logging)
- Blueprint UI definitions (`.blp`) alongside TypeScript files in feature directories
- CSS styles in `src/resources/styles/` with libadwaita variables

## Key Files and Their Purposes

### Core Application
- `src/main.ts` - Application entry point, GActions, CSS loading
- `src/core/window/window.ts` - Main window with ViewStack navigation and actions
- `src/core/logger.ts` - Centralized logging utility

### Features
- `src/features/auth/login/login.ts` - Login page with phone number validation
- `src/features/auth/welcome/welcome.ts` - Welcome page with user onboarding
- `src/features/chat/chat-view/chat-view.ts` - Complex chat interface with split view
- `src/features/chat/chat-welcome/chat-welcome.ts` - Chat welcome/empty state

### Shared Resources
- `src/shared/models/chat.model.ts` - Chat data models and interfaces
- `src/shared/services/user-service.ts` - User authentication service
- `src/shared/services/chat-service.ts` - Chat management service
- `src/shared/utils/validation.ts` - Phone number and input validation utilities
- `src/shared/utils/formatting.ts` - Text and data formatting utilities

### Resources and Configuration
- `src/resources/sh.alisson.Zap.src.gresource.xml` - Resource definitions
- `src/resources/styles/global.css` - Global CSS styles using libadwaita variables
- `src/resources/help-overlay.blp` - Keyboard shortcuts help overlay
- `src/**/*.blp` - Blueprint UI definitions throughout the project

### Build Configuration
- `src/meson.build` - Meson build configuration with modular source organization

## Critical Issue: JavaScript Context Loss in GJS Action Callbacks

### Problem
GJS (GNOME JavaScript) can lose the `this` context in action callbacks, causing template child references to become `undefined`. This manifests as:

- `this._stack` being `undefined` in action callbacks
- Template children not being accessible
- Actions appearing to work but failing silently

### Root Cause
The JavaScript context binding in GJS action callbacks can break, especially with template children stored as instance properties.

### Solution
**Always retrieve template children fresh in action callbacks:**

```typescript
// CORRECT: Retrieve fresh each time
private setupActions(): void {
    const action = new Gio.SimpleAction({ name: "my-action" });
    action.connect("activate", () => {
        // Retrieve template child fresh each time
        const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
        const widget = this.get_template_child(MyWindow.$gtype, "myWidget") as Gtk.Widget;

        if (stack && widget) {
            // Use the retrieved widgets
            stack.visible_child_name = "mypage";
        }
    });
    this.add_action(action);
}

// INCORRECT: Relying on cached reference (may become undefined)
private setupActions(): void {
    const action = new Gio.SimpleAction({ name: "my-action" });
    action.connect("activate", () => {
        this._stack.visible_child_name = "mypage"; // this._stack may be undefined!
    });
    this.add_action(action);
}
```

### Real-World Example: Login Page Fix
The login page issue was resolved by:

1. **Fresh stack retrieval** in both show-login and login actions
2. **Forced template child retrieval** when LoginPage lacks template children
3. **Proper error handling** with fallback mechanisms

```typescript
// In action callback - retrieve fresh
const stack = this.get_template_child(Window.$gtype, "stack") as Adw.ViewStack;
const loginPage = stack.visible_child as LoginPage;

// Force template children if missing
if (!loginPage.getPhoneNumber()) {
    const phoneEntry = loginPage.get_template_child(LoginPage.$gtype, "phoneEntry") as Gtk.Entry;
    (loginPage as any).phoneEntry = phoneEntry;
}
```

### Prevention
- Never rely on `this.property` in action callbacks
- Always use `get_template_child()` to retrieve widgets fresh
- Add comprehensive error logging to detect context loss
- Test actions thoroughly in development mode

## Testing

### TypeScript Type Checking
```bash
# Run strict type checking
bun run tsc --strict --noEmit
```

### Application Testing
```bash
# Run in development mode with hot reload
meson devenv -C builddir ./builddir/src/sh.alisson.Zap

# Test Flatpak build locally
flatpak run sh.alisson.Zap
```

## Debugging

### GTK Debugging
```bash
# Enable GTK debug output
GTK_DEBUG=all meson devenv -C builddir ./builddir/src/sh.alisson.Zap

# Debug specific GTK modules
GTK_DEBUG=actions,widgets meson devenv -C builddir ./builddir/src/sh.alisson.Zap
```

### GJS Debugging
```bash
# Run with GJS debugger
gjs -d ./builddir/src/sh.alisson.Zap
```

### Common Debug Issues
- **Missing icons**: Check gresource.xml includes all icon files
- **Template not loading**: Verify resource path matches gresource.xml
- **Actions not working**: Check action prefixes (app. vs win.)
- **CSS not applied**: Ensure CSS provider is loaded after display is available
- **Widget not found**: Check InternalChildren array matches Blueprint IDs exactly
- **TypeScript errors**: Verify all template children use `!` and proper typing
- **Blueprint compilation fails**: Check semicolon usage and property syntax
- **JavaScript context loss**: Retrieve template children fresh in action callbacks (see Critical Pattern above)

## Resource Management

### GResource Structure
```
/sh/alisson/Zap/
├── js/          # Compiled JavaScript files
├── ui/          # Compiled Blueprint (.ui) files
├── css/         # CSS stylesheets
└── icons/       # Application icons
```

### Adding New Resources
1. Add file to appropriate section in `src/sh.alisson.Zap.src.gresource.xml`
2. Reference with full resource path in code
3. Ensure Blueprint compiler processes .blp files to .ui

## Security Considerations

- Validate all user input before processing (especially phone numbers)
- Use secure communication protocols for network requests
- Follow Flatpak sandboxing best practices
- Keep GJS and GTK dependencies updated
- Be cautious with URI launching and external links
- Use `Gio.UriLauncher` for opening external URLs safely

### Secure URI Handling
```typescript
// CORRECT: Use Gio.UriLauncher for external URLs
const launcher = new Gtk.UriLauncher({ uri: "https://example.com" });
launcher.launch(this, null).catch(console.error);

// WRONG: Don't use direct system calls or unvalidated URLs
// exec(`xdg-open ${userInput}`) // ❌ Security risk!
```

## Performance Tips

- Use `vexpand: true` and `hexpand: true` for proper layout
- Avoid excessive widget creation in loops
- Use CSS classes instead of inline styling
- Consider using ListBox with custom rows for large datasets
- Use Adw.Avatar for user avatars (efficient and consistent)

## Common Development Workflow

### Adding a New Feature
1. Create feature directory under `src/features/` (e.g., `src/features/my-feature/`)
2. Create Blueprint file (`my-feature.blp`) and TypeScript controller (`my-feature.ts`)
3. Add files to appropriate sections in `src/meson.build`
4. Add UI resource path to `src/resources/sh.alisson.Zap.src.gresource.xml`
5. Register widget in main application startup (`src/main.ts`)
6. Add navigation and window actions in `src/core/window/window.ts`

### Adding a New Page
1. Create Blueprint file in appropriate feature directory (`src/features/[feature]/new-page.blp`)
2. Create TypeScript controller (`src/features/[feature]/new-page.ts`)
3. Add to `src/meson.build` sources list in appropriate section
4. Add to `src/resources/sh.alisson.Zap.src.gresource.xml`
5. Register in window's ViewStack in `src/core/window/window.ts`
6. Add navigation action in window class

### Adding a New Widget
1. Create Blueprint template file in appropriate directory (`my-widget.blp`)
2. Create TypeScript class (`my-widget.ts`) with GObject registration
3. Add template children to `InternalChildren` array
4. Access children in `vfunc_constructed()` using `get_template_child()`
5. Add CSS classes and styling as needed
6. Register widget in main application startup (`src/main.ts`)
7. Import widget in files where it's used

### Working with Translations
1. Mark translatable strings with `_()` in TypeScript files
2. Mark translatable strings with `_()` in Blueprint files
3. Update `po/POTFILES.in` to include new files
4. Run `meson compile -C builddir` to update translation files
5. Test with different locales using `LANGUAGE=pt_BR meson devenv -C builddir ./builddir/src/sh.alisson.Zap`

### Adding a New Action
1. Create GSimpleAction in appropriate class:
   - Application-level actions in `src/main.ts` (prefixed with "app.")
   - Window-level actions in `src/core/window/window.ts` (prefixed with "win.")
2. Connect to "activate" signal
3. Add to action map with `add_action()`
4. Set keyboard shortcuts with `set_accels_for_action()`
5. Reference in Blueprint menus or other UI elements if needed

### Styling Components
1. Add CSS classes in Blueprint files using `styles` array
2. Define styles in `src/resources/styles/global.css` using CSS variables
3. Use semantic color variables (var(--accent-bg-color), var(--view-bg-color), etc.)
4. Test with both light and dark themes
5. Follow libadwaita CSS variable naming conventions

## Blueprint Styling Syntax

### CSS Classes in Blueprint
```blueprint
// CORRECT: CSS classes in styles array
Button myButton {
  styles [
    "suggested-action",
    "pill",
  ]
}

// CORRECT: Multiple CSS classes on one line
Label myLabel {
  styles ["caption", "dim-label"]
}

// CORRECT: Alternative using css_classes property (less preferred)
Entry myEntry {
  css_classes: ["flat", "error"];
}
```

### Widget IDs in Blueprint
```blueprint
// CORRECT: Specify ID after widget type
Entry phoneEntry {
  placeholder-text: _("Phone number");
}

// CORRECT: Access in TypeScript via InternalChildren
static {
  GObject.registerClass(
    {
      Template: "resource:///sh/alisson/Zap/ui/login.ui",
      InternalChildren: ["phoneEntry"], // Match Blueprint ID
    },
    LoginPage,
  );
}
```

### Semicolon Usage in Blueprint
```blueprint
// CORRECT: NO semicolons in styles array
styles [
  "flat",
  "suggested-action",
]

// CORRECT: Semicolons required for property assignments
Button {
  label: _("Login");          // Semicolon required
  action-name: "win.login";   // Semicolon required
  halign: center;            // Semicolon required

  styles [                    // No semicolon after styles
    "suggested-action",
    "pill",
  ]
}

// WRONG: Semicolon after styles array
styles [
  "flat",
  "suggested-action",
]; // ❌ Don't put semicolon here
```

### Common Blueprint Patterns
```blueprint
// Template widget with CSS classes
template $Gjs_MyWidget: Adw.Bin {
  child: Box {
    orientation: vertical;
    spacing: 12;

    styles [
      "my-custom-class",
      "another-class",
    ]

    // Widget with ID for TypeScript access
    Label myLabel {
      label: _("Hello");
      css_classes: ["title"];  // This works, but `styles ["title"]` is preferrable.
    }
  };
}
```

### Blueprint Template Variables
```blueprint
// Use template variables for dynamic content
template $Gjs_ChatView: Adw.Bin {
  child: Adw.NavigationSplitView split_view {
    min-sidebar-width: 200;
    max-sidebar-width: 300;
    sidebar-width-fraction: 0.3;

    // Property bindings work like this
    show-sidebar: bind show_sidebar;
  };
}
```

### Blueprint Layout Properties
```blueprint
// Common layout properties for proper sizing
Box {
  orientation: vertical;
  spacing: 6;
  margin-start: 12;
  margin-end: 12;
  margin-top: 12;
  margin-bottom: 12;
  hexpand: true;    // Horizontal expansion
  vexpand: true;    // Vertical expansion
  halign: fill;     // Horizontal alignment
  valign: fill;     // Vertical alignment
}
```
