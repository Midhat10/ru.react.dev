/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // --- ДОБАВЬ ЭТИ ТРИ СТРОКИ ДЛЯ ГИТХАБА ---
  output: 'export', // Приказываем выдать готовые свитки в папку 'out'
  basePath: '/ru.react.dev', // Путь твоего надела на Гитхабе
  images: {unoptimized: true}, // Чтобы лики (картинки) работали без сервера
  // ----------------------------------------
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
  reactStrictMode: true,
  // Добавляем перечень узлов для сквозного прочтения
  transpilePackages: [
    'remark',
    'remark-html',
    'mdast-util-to-hast',
    'unist-util-visit',
  ],
  experimental: {
    scrollRestoration: true,
    reactCompiler: true,
    // Разрешаем вольное обращение с заморскими модулями
    esmExternals: 'loose',
  },
  env: {},
  webpack: (config, {dev, isServer, ...options}) => {
    if (process.env.ANALYZE) {
      const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: options.isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }

    config.resolve.alias['use-sync-external-store/shim'] = 'react';

    const {IgnorePlugin, NormalModuleReplacementPlugin} = require('webpack');
    config.plugins.push(
      new NormalModuleReplacementPlugin(
        /^raf$/,
        require.resolve('./src/utils/rafShim.js')
      ),
      new NormalModuleReplacementPlugin(
        /^process$/,
        require.resolve('./src/utils/processShim.js')
      ),
      new IgnorePlugin({
        checkResource(resource, context) {
          if (
            /\/eslint\/lib\/rules$/.test(context) &&
            /\.\/[\w-]+(\.js)?$/.test(resource)
          ) {
            return true;
          }
          return false;
        },
      })
    );

    return config;
  },
};

module.exports = nextConfig;
