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

## Common GTK/libadwaita Mistakes to Avoid

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

### 7. CSS Linting False Positives
```typescript
// NOTE: Most CSS linting errors are false-positives and should be ignored
// GTK's CSS implementation is not the same as web CSS and uses:
// - libadwaita-specific variables (@accent_bg_color, @view_bg_color)
// - GTK-specific properties and values
// - Different box model and layout behavior
// Only fix CSS errors that actually break the GTK styling
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
- TypeScript source files in `src/`
- Blueprint UI definitions in `.blp` files alongside `.ts` files
- CSS in `src/style.css` with libadwaita variables
- Resources defined in `src/sh.alisson.Zap.src.gresource.xml`

## Key Files and Their Purposes

- `src/main.ts` - Application entry point, GActions, CSS loading
- `src/window.ts` - Main window with ViewStack navigation
- `src/chat-view.ts` - Complex chat interface with split view
- `src/login.ts` - Login page with phone number input
- `src/welcome.ts` - Welcome page (minimal implementation)
- `src/logger.ts` - Centralized logging utility
- `src/*.blp` - Blueprint UI definitions
- `src/style.css` - CSS using libadwaita variables
- `src/sh.alisson.Zap.src.gresource.xml` - Resource definitions

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

### Adding a New Page
1. Create Blueprint file (`new-page.blp`)
2. Create TypeScript controller (`new-page.ts`)
3. Add to `src/meson.build` sources list
4. Add to `src/sh.alisson.Zap.src.gresource.xml`
5. Register in window's ViewStack
6. Add navigation action

### Adding a New Widget
1. Create Blueprint template file (`my-widget.blp`)
2. Create TypeScript class (`my-widget.ts`) with GObject registration
3. Add template children to `InternalChildren` array
4. Access children in `vfunc_constructed()` using `get_template_child()`
5. Add CSS classes and styling as needed
6. Register widget in main application startup

### Working with Translations
1. Mark translatable strings with `_()` in TypeScript
2. Mark translatable strings with `_()` in Blueprint files
3. Update `po/POTFILES.in` to include new files
4. Run `meson compile -C builddir` to update translation files
5. Test with different locales using `LANGUAGE=pt_BR ./builddir/src/sh.alisson.Zap`

### Adding a New Action
1. Create GSimpleAction in appropriate class (app or window level)
2. Connect to "activate" signal
3. Add to action map with `add_action()`
4. Set keyboard shortcuts with `set_accels_for_action()`
5. Reference in Blueprint menus if needed

### Styling Components
1. Add CSS classes in Blueprint files
2. Define styles in `src/style.css` using libadwaita variables
3. Use semantic color variables (@accent_bg_color, @view_bg_color, etc.)
4. Test with both light and dark themes

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
