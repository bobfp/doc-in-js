module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { chrome: "58" },
      },
    ],
  ],
  plugins: ["babel-plugin-macros"],
};
