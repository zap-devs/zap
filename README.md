# Zap - Unofficial WhatsApp Client for GNOME

Zap is an unofficial WhatsApp client for the GNOME desktop, built with GTK 4 and libadwaita to provide a native messaging experience that integrates seamlessly with your desktop environment.

> [!IMPORTANT]
> This project is not affiliated with, endorsed by, or associated with WhatsApp, Meta Platforms Inc., or any of their subsidiaries. This is an independent open-source project inspired by modern chat application design patterns.

![Zap Screenshot](data/screenshots/screenshot-2.png)

## Features

- **Modern GTK 4 Interface**: Built with the latest GTK 4 and libadwaita for a native GNOME experience
- **Native WhatsApp Experience**: Familiar chat interface with WhatsApp functionality
- **Multi-Platform**: Distributed via Flatpak for easy installation across Linux distributions
- **TypeScript Development**: Type-safe development with TypeScript and proper type definitions
- **Responsive Layout**: Adaptive interface that works well on different screen sizes
- **Native GNOME Integration**: Follows GNOME Human Interface Guidelines and integrates seamlessly with the desktop

## Screenshots

![Chat Interface](data/screenshots/screenshot-1.png)
*Main chat interface with conversation view*

![Welcome Screen](data/screenshots/screenshot-2.png)
*Welcome screen with modern design*

## Installation

For detailed installation and building instructions, see [BUILDING.md](BUILDING.md).

### Quick Install (Flatpak)

```bash
# Add Flathub repository (if not already added)
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install Zap
flatpak install sh.alisson.Zap
```

## Technology Stack

- **Language**: TypeScript (compiled to JavaScript for GJS runtime)
- **UI Framework**: GTK 4 + libadwaita 1.x with Blueprint markup
- **Runtime**: GJS (GNOME JavaScript) with GObject introspection
- **Build System**: Meson + Blueprint compiler + TypeScript compiler
- **Package Manager**: Bun (for TypeScript tooling)
- **Distribution**: Flatpak

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run type checking (`bun run tsc --strict --noEmit`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [GTK](https://gtk.org/) and [libadwaita](https://gnome.pages.gitlab.gnome.org/libadwaita/)
- Uses [GJS](https://gitlab.gnome.org/GNOME/gjs/) for JavaScript bindings
- Inspired by modern chat applications and GNOME design principles

## Support

If you encounter any issues or have questions:

- Create an issue on [GitHub Issues](https://github.com/alissonlauand/zap/issues)
- Check the [Wiki](https://github.com/alissonlauand/zap/wiki) for documentation
- Join our [Discussions](https://github.com/alissonlauand/zap/discussions)

---

> [!NOTE]
> This is a desktop application that requires a Linux environment with GTK 4 support. For the best experience, we recommend using GNOME or a GTK-based desktop environment.
