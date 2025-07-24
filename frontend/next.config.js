/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000'
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com']
  }
}

module.exports = nextConfig