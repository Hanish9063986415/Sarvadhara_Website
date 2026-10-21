import type { MetadataRoute } from 'next'
import { AUTOMATE_BASE_PATH, AUTOMATE_LEGACY_BASE_PATH } from '@/lib/automate-routes'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        AUTOMATE_BASE_PATH,
        `${AUTOMATE_BASE_PATH}/`,
        AUTOMATE_LEGACY_BASE_PATH,
        `${AUTOMATE_LEGACY_BASE_PATH}/`,
      ],
    },
  }
}
