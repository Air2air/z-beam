// app/sitemap.js
import { getMaterialList } from 'app/utils/utils' // Your existing utility

export const baseUrl = 'https://portfolio-material-starter.vercel.app'

export default async function sitemap() {
  const materials = getMaterialList().map((post) => ({
    url: `${baseUrl}/(materials)/${post.slug}`,
    lastModified: new Date(post.metadata.publishedAt || new Date().toISOString()).toISOString(), // Full ISO string
    changeFrequency: 'weekly', // Example: Adjust based on your update frequency
    priority: 0.8, // Example: Prioritize material posts
  }))

  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date('2023-01-01').toISOString(), // Use actual last modified if static, or a reasonable default
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/material`,
      lastModified: new Date('2023-01-01').toISOString(), // Use actual last modified
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Add other static routes as needed
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date('2023-01-01').toISOString(),
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
  ]

  return [...routes, ...materials]
}

// Consider if you need a revalidate option for more frequent updates
// export const revalidate = 3600 // Revalidate at most every hour (for Route Handlers that serve dynamic sitemaps)