const path = require('path');

module.exports = {
  style: {
    postcss: {
      mode: 'extends',
      loaderOptions: {
        postcssOptions: {
          ident: 'postcss',
          config: false,
          plugins: [
            'tailwindcss',
            'autoprefixer',
          ],
        },
      },
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // 确保CSS加载器正确处理Tailwind
      const cssRule = webpackConfig.module.rules.find(rule =>
        rule.oneOf && rule.oneOf.find(oneOf =>
          oneOf.test && oneOf.test.toString().includes('css')
        )
      );

      if (cssRule && cssRule.oneOf) {
        cssRule.oneOf.forEach(rule => {
          if (rule.test && rule.test.toString().includes('css') && rule.use) {
            const postcssLoader = rule.use.find(loader =>
              loader.loader && loader.loader.includes('postcss-loader')
            );
            if (postcssLoader && postcssLoader.options) {
              postcssLoader.options.postcssOptions = {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              };
            }
          }
        });
      }

      return webpackConfig;
    },
  },
}
