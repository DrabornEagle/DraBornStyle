// Only the public website export sets a subdirectory. Android / Expo Go keep
// their existing config, asset paths and drabornstyle:// deep links.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.DKD_WEB_BASE_URL || "",
  },
});
