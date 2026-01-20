// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images:{
//         remotePatterns:[{hostname:"images.pexels.com"},{hostname:"res.cloudinary.com"}]
//     }
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" },
      { 
        protocol: "https", 
        hostname: "img.clerk.com" 
      }
    ],
  },
};

export default nextConfig;