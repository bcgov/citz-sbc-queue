import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: 'standalone',

  // Production optimizations
  compress: true,

  // Webpack configuration to handle Node.js built-in modules
  webpack: (config) => {
    // Custom plugin to handle node: protocol imports
    // This resolves the issue where @bcgov/citz-imb-sso-js-core imports node:querystring
    // which is not supported in browser environments
    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler: any) => {
        compiler.hooks.normalModuleFactory.tap('NodeProtocolPlugin', (factory: any) => {
          factory.hooks.beforeResolve.tap('NodeProtocolPlugin', (data: any) => {
            if (data.request === 'node:querystring') {
              data.request = 'qs';
            }
          });
        });
      },
    });

    // Provide fallbacks for Node.js built-ins not available in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      querystring: require.resolve('qs'),
    };

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
