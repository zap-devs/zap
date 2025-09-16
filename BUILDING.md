# Building Zap

This document provides detailed instructions for building and installing Zap from source.

## Technology Stack

- **Language**: TypeScript (compiled to JavaScript for GJS runtime)
- **UI Framework**: GTK 4 + libadwaita 1.x with Blueprint markup
- **Runtime**: GJS (GNOME JavaScript) with GObject introspection
- **Build System**: Meson + Blueprint compiler + TypeScript compiler
- **Package Manager**: Bun (for TypeScript tooling)
- **Distribution**: Flatpak

## Prerequisites

Before building Zap, ensure you have the following dependencies installed:

- Bun (for TypeScript compilation and tooling)
- Meson build system (>= 0.62.0)
- Blueprint compiler (`blueprint-compiler`)
- Flatpak development tools
- GTK 4 and libadwaita development libraries
- GJS (>= 1.54.0)

### Installing Dependencies

On Fedora/RHEL:
```bash
sudo dnf install meson blueprint-compiler flatpak-builder gtk4-devel libadwaita-devel gjs
```

On Ubuntu/Debian:
```bash
sudo apt install meson blueprint-compiler flatpak-builder libgtk-4-dev libadwaita-1-dev gjs
```

On Arch Linux:
```bash
sudo pacman -S meson blueprint-compiler flatpak-builder gtk4 libadwaita gjs
```

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

## Installation

### From Flatpak (Recommended)

```bash
# Add Flathub repository (if not already added)
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install Zap
flatpak install sh.alisson.Zap
```

### Building from Source

1. **Clone the repository:**
```bash
git clone https://github.com/alissonlauand/zap.git
cd zap
```

2. **Install TypeScript dependencies:**
```bash
bun install
```

3. **Configure and build with Meson:**
```bash
meson setup builddir
meson compile -C builddir
```

4. **Install locally (optional):**
```bash
meson install -C builddir
```

## Development

### Setting Up Development Environment

1. **Configure debug build:**
```bash
meson setup builddir --buildtype=debug
```

2. **Compile TypeScript and Blueprint files:**
```bash
meson compile -C builddir
```

3. **Run the application in development mode:**
```bash
meson devenv -C builddir ninja devel
```

### Build Commands

**Development Build:**
```bash
meson setup builddir --buildtype=debug
meson compile -C builddir
meson devenv -C builddir ninja devel
```

**Production Build:**
```bash
meson setup builddir --buildtype=release
meson compile -C builddir
flatpak-builder --repo=repo build-aux/flatpak/sh.alisson.Zap.json
```

**TypeScript Compilation Only:**
```bash
# Type check without emitting files
bun run tsc --strict --noEmit

# Build TypeScript files to JavaScript
bun run tsc --strict
```

### Testing

**TypeScript Type Checking:**
```bash
bun run tsc --strict --noEmit
```

**Run Application:**
```bash
meson devenv -C builddir ninja devel
```

**Test Flatpak Build:**
```bash
flatpak-builder --user --install --force-clean build-aux/flatpak/sh.alisson.Zap.json
flatpak run sh.alisson.Zap
```

### Debugging

**Enable GTK Debug Output:**
```bash
GTK_DEBUG=all meson devenv -C builddir ninja devel
```

**Debug Specific GTK Modules:**
```bash
GTK_DEBUG=actions,widgets meson devenv -C builddir ninja devel
```

**GJS Debugging:**
```bash
gjs -d ./builddir/src/sh.alisson.Zap
```

## Project Structure

```
zap/
├── src/                          # Source code
│   ├── core/                     # Core application components
│   │   ├── logger.ts            # Centralized logging
│   │   └── window/              # Main window with navigation
│   ├── features/                # Feature-specific modules
│   │   ├── auth/                # Authentication features
│   │   └── chat/                # Chat features
│   ├── shared/                  # Shared utilities and services
│   ├── resources/               # Resource files (styles, gresource.xml)
│   └── types/                   # TypeScript type definitions
├── data/                        # Application data and icons
├── po/                          # Translation files
├── build-aux/                   # Build configuration
└── src/                         # TypeScript source files