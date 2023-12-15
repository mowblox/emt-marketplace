/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
          },
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
          },
        ],
      },
      webpack: (config) => {
        config.externals.push("pino-pretty"/*, "lokijs", "encoding"*/);
        return config;
      },
}

module.exports = nextConfig
