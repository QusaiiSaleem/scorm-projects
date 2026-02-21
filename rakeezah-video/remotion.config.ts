import { Config } from "@remotion/cli/config";

// Custom webpack override for Tailwind v4
// We can't use @remotion/tailwind's enableTailwind() because it assumes
// Tailwind v3 (uses 'tailwindcss' as PostCSS plugin directly).
// Tailwind v4 uses '@tailwindcss/postcss' as its PostCSS plugin.
Config.overrideWebpackConfig((currentConfig) => {
  // Find and replace the default CSS rule to add postcss-loader
  const rules = (currentConfig.module?.rules ?? []).map((rule) => {
    // Skip non-object rules
    if (!rule || typeof rule !== "object") return rule;

    // Find the CSS rule (matches .css files)
    if (rule.test instanceof RegExp && rule.test.test("test.css")) {
      return {
        test: /\.css$/i,
        use: [
          // style-loader injects CSS into the DOM
          "style-loader",
          // css-loader resolves @import and url()
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: false,
            },
          },
          // postcss-loader runs Tailwind v4
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["@tailwindcss/postcss"],
              },
            },
          },
        ],
      };
    }

    return rule;
  });

  return {
    ...currentConfig,
    module: {
      ...currentConfig.module,
      rules,
    },
  };
});
