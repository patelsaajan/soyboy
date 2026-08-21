import { describe, expect, it, vi } from 'vitest'
import { withEdgeCache } from './edgeCache'
import type { EdgeCache, NitroFetchInit } from './edgeCache'

/** A Cache API stand-in that records what it was asked to store. */
function fakeCache() {
  const store = new Map<string, Response>()
  const puts: Array<{ url: string; response: Response }> = []
  const cache: EdgeCache = {
    match: async (request) => store.get(request.url)?.clone(),
    put: async (request, response) => {
      puts.push({ url: request.url, response: response.clone() })
      store.set(request.url, response)
    },
  }
  return { cache, puts, store }
}

const init = (url: string, method = 'GET'): NitroFetchInit => ({
  context: { _platform: { cloudflare: { request: new Request(url, { method }) } } },
})

const PAGE = 'https://soyboy.saajanpatel.co.uk/recipes/lentil-bolognese'

describe('withEdgeCache', () => {
  it('stores a cacheable 200 and serves the second request from cache', async () => {
    const { cache, puts } = fakeCache()
    const inner = vi.fn(async () => new Response('body', { status: 200 }))
    const fetch = withEdgeCache(inner, cache)

    const miss = await fetch('/recipes/lentil-bolognese', init(PAGE))
    expect(miss.headers.get('x-edge-cache')).toBe('MISS')
    expect(await miss.text()).toBe('body')
    expect(puts).toHaveLength(1)

    const hit = await fetch('/recipes/lentil-bolognese', init(PAGE))
    expect(hit.headers.get('x-edge-cache')).toBe('HIT')
    expect(await hit.text()).toBe('body')
    // The whole point: the second request never reached the renderer.
    expect(inner).toHaveBeenCalledTimes(1)
  })

  /**
   * The stored copy carries the tag; the copy the visitor gets does not. A tag
   * that never reaches the cache makes tag-purge silently useless, which is the
   * fallback for content whose URL nobody could predict.
   */
  it('tags the stored copy and strips the tag from the served copy', async () => {
    const { cache, puts } = fakeCache()
    const fetch = withEdgeCache(async () => new Response('x', { status: 200 }), cache)

    const res = await fetch('/recipes/lentil-bolognese', init(PAGE))
    expect(puts[0]!.response.headers.get('cache-tag')).toBe('soyboy-content')
    expect(res.headers.get('cache-tag')).toBeNull()
  })

  it('never stores a response carrying Set-Cookie', async () => {
    const { cache, puts } = fakeCache()
    const fetch = withEdgeCache(
      async () => new Response('x', { status: 200, headers: { 'set-cookie': 'session=abc' } }),
      cache,
    )

    await fetch('/recipes/lentil-bolognese', init(PAGE))
    expect(puts[0]!.response.headers.get('set-cookie')).toBeNull()
  })

  it('does not cache errors', async () => {
    for (const status of [301, 404, 500]) {
      const { cache, puts } = fakeCache()
      const fetch = withEdgeCache(async () => new Response('x', { status }), cache)
      const res = await fetch('/recipes/lentil-bolognese', init(PAGE))
      expect(puts, String(status)).toHaveLength(0)
      expect(res.headers.get('x-edge-cache'), String(status)).toBeNull()
    }
  })

  it('leaves uncacheable routes and non-GET methods untouched', async () => {
    const { cache, puts } = fakeCache()
    const fetch = withEdgeCache(async () => new Response('x', { status: 200 }), cache)

    const admin = await fetch('/admin', init('https://soyboy.saajanpatel.co.uk/admin'))
    expect(admin.headers.get('x-edge-cache')).toBeNull()

    const post = await fetch('/recipes/lentil-bolognese', init(PAGE, 'POST'))
    expect(post.headers.get('x-edge-cache')).toBeNull()

    expect(puts).toHaveLength(0)
  })

  /**
   * The write is handed to waitUntil so the visitor is not made to wait for it.
   * Without a waitUntil (there is none off-Workers) it is awaited instead, which
   * is slower but never drops the write.
   */
  it('defers the cache write to waitUntil when one is available', async () => {
    const { cache, puts } = fakeCache()
    const deferred: Array<Promise<unknown>> = []
    const fetch = withEdgeCache(async () => new Response('x', { status: 200 }), cache)

    await fetch('/recipes/lentil-bolognese', {
      context: {
        waitUntil: (p) => deferred.push(p),
        _platform: { cloudflare: { request: new Request(PAGE) } },
      },
    })

    expect(deferred).toHaveLength(1)
    await Promise.all(deferred)
    expect(puts).toHaveLength(1)
  })

  it('serves the page even when the cache write fails', async () => {
    const cache: EdgeCache = {
      match: async () => undefined,
      put: async () => {
        throw new Error('cache unavailable')
      },
    }
    const fetch = withEdgeCache(async () => new Response('body', { status: 200 }), cache)

    const res = await fetch('/recipes/lentil-bolognese', init(PAGE))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body')
  })
})
