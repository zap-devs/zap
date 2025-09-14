gnome = import('gnome')

sources = files(
  'logger.ts',
  'main.ts',
  'window.ts',
  'welcome.ts',
  'login.ts',
  'chat-view.ts',
  'chat-welcome.ts',
)

tsc_out = meson.project_build_root() / 'tsc-out'

typescript = custom_target(
  'typescript-compile',
  input: sources,
  build_by_default: true,
  build_always_stale: true,
  command: [ tsc, '--outDir', tsc_out ],
  output: ['tsc-output'],
)

blueprints = custom_target('blueprints',
  input: files(
    'help-overlay.blp',
    'window.blp',
    'welcome.blp',
    'login.blp',
    'chat-view.blp',
    'chat-welcome.blp',
  ),
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