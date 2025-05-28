module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {},
        "transform-runtime": {},
        "styled-jsx": {},
        "class-properties": {},
      },
    ],
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ],
  // Disable any code transformation that might use astring
  assumptions: {
    setPublicClassFields: true,
  },
  // Ignore problematic modules
  ignore: [/node_modules\/(?!astring)/],
}
