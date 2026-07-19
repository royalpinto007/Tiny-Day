const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// When bundling a standalone dev bundle (EXPO_EMBED_DEV=1) the app has no Metro
// dev server to talk to. Modules that open a devtools websocket throw at import
// time in that situation, so swap them for a no-op.
if (process.env.EXPO_EMBED_DEV === '1') {
  const stub = path.resolve(__dirname, 'scripts/empty-module.js');
  const defaultResolve = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const resolve = defaultResolve ?? context.resolveRequest;
    const result = resolve(context, moduleName, platform);
    if (
      result &&
      result.type === 'sourceFile' &&
      /async-require[\\/]messageSocket/.test(result.filePath)
    ) {
      return { type: 'sourceFile', filePath: stub };
    }
    return result;
  };
}

module.exports = config;
