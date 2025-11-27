const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
    vm: require.resolve("vm-browserify"),
    process: require.resolve("process/browser"),
  });
  config.resolve.fallback = fallback;
  config.resolve.alias = Object.assign({}, config.resolve.alias, {
    "process/browser": require.resolve("process/browser"),
  });
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  const rules = config.module && config.module.rules ? config.module.rules : [];
  rules.forEach((rule) => {
    if (rule && rule.loader && typeof rule.loader === "string" && rule.loader.includes("source-map-loader")) {
      rule.exclude = /node_modules/;
    }
    if (rule && Array.isArray(rule.use)) {
      rule.use = rule.use.map((useEntry) => {
        if (typeof useEntry === "string" && useEntry.includes("source-map-loader")) {
          return { loader: useEntry, options: {}, exclude: /node_modules/ };
        }
        if (useEntry && useEntry.loader && useEntry.loader.includes("source-map-loader")) {
          useEntry.exclude = /node_modules/;
        }
        return useEntry;
      });
    }
  });

  config.ignoreWarnings = (config.ignoreWarnings || []).concat([
    (warning) => {
      const msg = (warning && warning.message) || "";
      const res = (warning && warning.module && warning.module.resource) || "";
      return msg.includes("Failed to parse source map") && /node_modules[\\/]/.test(res);
    },
  ]);

  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};