<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { public: { siteUrl, siteName } } = useRuntimeConfig()
const origin = String(siteUrl).replace(/\/$/, '')

// Site-level entity graph: gives search engines a brand entity to attach the
// per-page Recipe markup to, via the publisher @id reference.
useJsonLd({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: siteName,
      url: `${origin}/`,
      logo: `${origin}/favicon.svg`,
      founder: { '@type': 'Person', name: 'Saajan Patel', url: 'https://saajanpatel.co.uk' },
      sameAs: [
        'https://www.instagram.com/soyboysaajan/',
        'https://github.com/patelsaajan',
        'https://saajanpatel.co.uk',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: siteName,
      publisher: { '@id': `${origin}/#organization` },
      inLanguage: 'en-GB',
    },
  ],
})
</script>