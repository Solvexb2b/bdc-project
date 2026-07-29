const BLINK_DISABLED_MESSAGE =
  'Blink is optional and disabled in the default build. Set VITE_ENABLE_BLINK=true and install @blinkdotnew/sdk to enable it.'

export const isBlinkEnabled =
  import.meta.env.VITE_ENABLE_BLINK === 'true' &&
  !!import.meta.env.VITE_BLINK_PROJECT_ID &&
  !!import.meta.env.VITE_BLINK_PUBLISHABLE_KEY

export const blinkWidgetScriptSrc =
  isBlinkEnabled && import.meta.env.VITE_BLINK_PROJECT_ID
    ? `https://blink.new/widget.js?projectId=${encodeURIComponent(import.meta.env.VITE_BLINK_PROJECT_ID)}`
    : null

type BlinkClient = any
type Unsubscribe = () => void

let blinkClientPromise: Promise<BlinkClient | null> | null = null
let blinkLoadWarningShown = false

function blinkUnavailable(feature: string) {
  return new Error(`${feature} is unavailable. ${BLINK_DISABLED_MESSAGE}`)
}

function warnBlinkLoadFailure(error: unknown) {
  if (blinkLoadWarningShown) return
  blinkLoadWarningShown = true
  console.warn('[blink] Failed to load optional Blink SDK; continuing without Blink support.', error)
}

async function getBlinkClient(): Promise<BlinkClient | null> {
  if (!isBlinkEnabled) return null
  if (!blinkClientPromise) {
    blinkClientPromise = (async () => {
      try {
        const importer = new Function('specifier', 'return import(specifier)') as (
          specifier: string,
        ) => Promise<{ createClient: (config: Record<string, unknown>) => BlinkClient }>
        const { createClient } = await importer('@blinkdotnew/sdk')
        return createClient({
          projectId: import.meta.env.VITE_BLINK_PROJECT_ID,
          publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
          authRequired: false,
          auth: { mode: 'managed' },
        })
      } catch (error) {
        warnBlinkLoadFailure(error)
        return null
      }
    })()
  }
  return blinkClientPromise
}

async function withBlink<T>(feature: string, run: (client: BlinkClient) => Promise<T> | T): Promise<T> {
  const client = await getBlinkClient()
  if (!client) throw blinkUnavailable(feature)
  return run(client)
}

export const blink = {
  auth: {
    onAuthStateChanged(callback: (state: { isAuthenticated: boolean }) => void): Unsubscribe {
      callback({ isAuthenticated: false })

      let active = true
      let unsubscribe: Unsubscribe | undefined

      void getBlinkClient().then(client => {
        if (!active || !client?.auth?.onAuthStateChanged) return
        unsubscribe = client.auth.onAuthStateChanged(callback)
      })

      return () => {
        active = false
        unsubscribe?.()
      }
    },
  },
  ai: {
    streamText(
      options: Record<string, unknown>,
      onChunk: (chunk: string) => void,
    ) {
      return withBlink('Blink AI', client => client.ai.streamText(options, onChunk))
    },
  },
  db: {
    table<T>(name: string) {
      return {
        upsert(payload: T) {
          return withBlink('Blink database', client => client.db.table(name).upsert(payload))
        },
        create(payload: T) {
          return withBlink('Blink database', client => client.db.table(name).create(payload))
        },
      }
    },
  },
  notifications: {
    email(payload: Record<string, unknown>) {
      return withBlink('Blink notifications', client => client.notifications.email(payload))
    },
  },
  realtime: {
    publish(channelName: string, messageType: string, payload: unknown) {
      return withBlink('Blink realtime', client => client.realtime.publish(channelName, messageType, payload))
    },
    channel(name: string) {
      const getChannel = async () => {
        const client = await getBlinkClient()
        return client?.realtime?.channel?.(name) ?? null
      }

      return {
        onMessage(callback: (message: unknown) => void) {
          void getChannel().then(channel => channel?.onMessage?.(callback))
        },
        async subscribe(options: Record<string, unknown>) {
          const channel = await getChannel()
          if (!channel?.subscribe) throw blinkUnavailable('Blink realtime')
          return channel.subscribe(options)
        },
        unsubscribe() {
          void getChannel().then(channel => channel?.unsubscribe?.())
        },
      }
    },
  },
  rag: {
    createCollection(payload: Record<string, unknown>) {
      return withBlink('Blink RAG', client => client.rag.createCollection(payload))
    },
    upload(payload: Record<string, unknown>) {
      return withBlink('Blink RAG', client => client.rag.upload(payload))
    },
    getDocument(id: string) {
      return withBlink('Blink RAG', client => client.rag.getDocument(id))
    },
    aiSearch(payload: Record<string, unknown>) {
      return withBlink('Blink RAG', client => client.rag.aiSearch(payload))
    },
  },
}
