gnome = import('gnome')

# Define all TypeScript source files with their new paths
typescript_sources = files(
  # Core application files
  'main.ts',
  'core/window/window.ts',
  'core/logger.ts',

  # Feature files
  'features/auth/login/login.ts',
  'features/auth/welcome/welcome.ts',
  'features/chat/chat-view/chat-view.ts',
  'features/chat/chat-welcome/chat-welcome.ts',
  'features/chat/chat-content/chat-content.ts',
  'features/chat/chat-list-item/chat-list-item.ts',

  # Shared files
  'shared/models/chat.model.ts',
  'shared/services/chat-service.ts',
  'shared/services/user-service.ts',
  'shared/utils/validation.ts',
)

# Define all Blueprint files with their new paths
blueprint_files = files(
  'core/window/window.blp',
  'features/auth/login/login.blp',
  'features/auth/welcome/welcome.blp',
  'features/chat/chat-view/chat-view.blp',
  'features/chat/chat-welcome/chat-welcome.blp',
  'features/chat/chat-content/chat-content.blp',
  'features/chat/chat-list-item/chat-list-item.blp',
  'features/chat/components/message-bubble/message-bubble.blp',
  'resources/help-overlay.blp',
)

tsc_out = meson.project_build_root() / 'tsc-out'

typescript = custom_target(
  'typescript-compile',
  input: typescript_sources,
  build_by_default: true,
  build_always_stale: true,
  command: [ tsc, '--outDir', tsc_out ],
  output: ['tsc-output'],
)

blueprints = custom_target('blueprints',
  input: blueprint_files,
  output: '.',
  command: [
    find_program('blueprint-compiler'),
    'batch-compile',
    '@OUTPUT@',
    '@CURRENT_SOURCE_DIR@',
    '@INPUT@',
  ],
)

src_res = gnome.compile_resources(
  'sh.alisson.Zap.src',
  'sh.alisson.Zap.src.gresource.xml',
  dependencies: [typescript, blueprints],
  source_dir: tsc_out,
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

bin_conf = configuration_data()
bin_conf.set('GJS', gjs_console)
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))
bin_conf.set('resource_path', '/sh/alisson/Zap')

app_launcher = configure_file(
  input: 'sh.alisson.Zap.in',
  output: 'sh.alisson.Zap',
  configuration: bin_conf,
  install: true,
  install_dir: get_option('bindir')
)

run_target(
  'devel',
  command: [gjs_console, '-m', app_launcher],
  depends: [src_res, compile_local_schemas]
)