const ENV = process.env.APP_ENV ?? "dev";

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    appEnv: ENV
  }
});
