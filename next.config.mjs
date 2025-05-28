/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // GitHub Pages configuration
  basePath: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH : '',
  
  // Disable server-side features for static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Generate static files
  distDir: 'out',
  
  // Disable strict mode for better compatibility
  reactStrictMode: false,
  
  // Experimental features for better performance
  experimental: {
    // Disable features that might use problematic dependencies
    optimizePackageImports: ['lucide-react'],
    esmExternals: 'loose',
  },
  
  // Webpack configuration for better GitHub Pages compatibility
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        astring: false,
      }
    }

    // Explicitly exclude problematic modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules\/astring/,
      use: 'null-loader',
    });

    // Development optimizations
    if (dev) {
      // Ignore files that shouldn't trigger rebuilds during development
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/public/posts/index.json',
          '**/public/sitemap.xml',
          '**/out/**',
          '**/.next/**',
          '**/scripts/generate-*.js',
          '**/*.tmp',
          '**/*.swp',
          '**/*~',
        ],
        // Reduce CPU usage by polling less frequently
        poll: 1000,
        aggregateTimeout: 300,
      }

      // Optimize for faster rebuilds
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
      }
    }

    return config
  },

  // Enable source maps only in development
  productionBrowserSourceMaps: false,

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
