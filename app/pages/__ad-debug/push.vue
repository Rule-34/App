<script setup lang="ts">
  import {
    getPushAdProviderByKey,
    parsePushAdProviderMode,
    pushAdProviderModes,
    pushAdProviders,
    selectRandomPushAdProviderScript,
    type PushAdProviderKey
  } from '~/composables/useAdvertisements'
  import {
    createPushAdDebugReport,
    createPushAdDebugVerdict,
    type PushAdDebugEvent,
    type PushAdDebugEventType
  } from '~/assets/js/advertising/push-ad-debug-report'

  useSeoMeta({
    robots: 'noindex, nofollow',
    title: 'Push ad local evidence debug'
  })

  const route = useRoute()
  const testTarget = useTemplateRef<HTMLButtonElement>('testTarget')

  const providerMode = computed(() => parsePushAdProviderMode(route.query.provider))
  const selectedRandomScript = ref('')
  const status = ref('idle')
  const armed = ref(false)
  const instrumentationInstalled = ref(false)
  const clientMounted = ref(false)
  const startedAt = ref('')
  const startedAtMs = ref(0)
  const armedProviderMode = ref(providerMode.value)
  const armedProviderLabel = ref('')
  const armedScriptUrl = ref('')
  const clickCount = ref(0)
  const events = ref<PushAdDebugEvent[]>([])
  const scriptedRunActive = ref(false)

  const selectedProvider = computed(() => {
    if (providerMode.value !== 'random') {
      return getPushAdProviderByKey(providerMode.value as PushAdProviderKey)
    }

    return (
      pushAdProviders.find((provider) => provider.id === selectedRandomScript.value) ?? getPushAdProviderByKey('evadav')
    )
  })
  const selectedProviderLabel = computed(() =>
    providerMode.value === 'random' ? `Random (${selectedProvider.value.label})` : selectedProvider.value.label
  )
  const selectedScriptUrl = computed(() =>
    providerMode.value === 'random' ? selectedRandomScript.value : selectedProvider.value.id
  )
  const reportProviderMode = computed(() => (armed.value ? armedProviderMode.value : providerMode.value))
  const reportProviderLabel = computed(() => (armed.value ? armedProviderLabel.value : selectedProviderLabel.value))
  const reportScriptUrl = computed(() => (armed.value ? armedScriptUrl.value : selectedScriptUrl.value))
  const verdict = computed(() => createPushAdDebugVerdict(events.value))
  const reportJson = computed(() => {
    if (!clientMounted.value) {
      return ''
    }

    return createPushAdDebugReport({
      providerMode: reportProviderMode.value,
      providerLabel: reportProviderLabel.value,
      scriptUrl: reportScriptUrl.value,
      status: status.value,
      startedAt: startedAt.value,
      currentUrl: window.location.href,
      referrer: document.referrer,
      clickCount: clickCount.value,
      events: events.value
    })
  })

  onMounted(() => {
    clientMounted.value = true
  })

  watch(
    providerMode,
    () => {
      if (armed.value) {
        return
      }

      selectedRandomScript.value =
        import.meta.client && providerMode.value === 'random' ? selectRandomPushAdProviderScript() : ''
      clearReport()
    },
    { immediate: true }
  )

  function elapsedMs() {
    return startedAtMs.value ? Math.max(0, Math.round(performance.now() - startedAtMs.value)) : 0
  }

  function addEvent(type: PushAdDebugEventType, details: Partial<PushAdDebugEvent> = {}) {
    events.value.push({
      type,
      timestamp: new Date().toISOString(),
      elapsedMs: elapsedMs(),
      ...details
    })
  }

  function getStack() {
    return new Error().stack?.split('\n').slice(2).join('\n')
  }

  let originalWindowOpen: typeof window.open | null = null
  let originalNotificationRequestPermission: typeof Notification.requestPermission | null = null
  let mutationObserver: MutationObserver | null = null
  const trackedListeners: {
    target: EventTarget
    type: string
    handler: EventListenerOrEventListenerObject
    options?: boolean
  }[] = []

  function addTrackedListener(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean
  ) {
    target.addEventListener(type, handler, options)
    trackedListeners.push({ target, type, handler, options })
  }

  function patchNotificationPermission() {
    if (!('Notification' in window)) {
      addEvent('notification-permission-request', {
        permission: 'unsupported',
        message: 'Notification API unsupported'
      })
      return
    }

    originalNotificationRequestPermission = Notification.requestPermission.bind(Notification)
    Notification.requestPermission = ((callback?: NotificationPermissionCallback) => {
      addEvent('notification-permission-request', { permission: Notification.permission, stack: getStack() })
      const result = originalNotificationRequestPermission!(callback)
      void result.then((permission) => addEvent('notification-permission-result', { permission }))
      return result
    }) as typeof Notification.requestPermission
  }

  function installMutationObserver() {
    mutationObserver = new MutationObserver((records) => {
      const added = records.flatMap((record) => Array.from(record.addedNodes)).filter((node) => node instanceof Element)
      const adLikeNodes = added.filter((node) => {
        const element = node as Element
        return (
          element.matches('iframe, ins, [id*="ad" i], [class*="ad" i]') ||
          Boolean(element.querySelector('iframe, ins, [id*="ad" i], [class*="ad" i]'))
        )
      })

      if (adLikeNodes.length > 0) {
        addEvent('dom-mutation', {
          label: adLikeNodes.map((node) => (node as Element).tagName.toLowerCase()).join(','),
          message: `added ${adLikeNodes.length} ad-like node(s)`
        })
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  }

  function installInstrumentation() {
    if (instrumentationInstalled.value) {
      return
    }

    instrumentationInstalled.value = true

    const originalOpen = window.open.bind(window)
    originalWindowOpen = originalOpen
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      addEvent('window-open', { url: String(url ?? ''), target, message: features, stack: getStack() })
      return originalOpen(url, target, features)
    }) as typeof window.open

    patchNotificationPermission()
    installMutationObserver()

    addTrackedListener(document, 'visibilitychange', () =>
      addEvent('visibilitychange', { visibilityState: document.visibilityState })
    )
    addTrackedListener(window, 'focus', () => addEvent('focus'))
    addTrackedListener(window, 'blur', () => addEvent('blur'))
    addTrackedListener(window, 'pageshow', () => addEvent('pageshow'))
    addTrackedListener(window, 'pagehide', () => addEvent('pagehide', { visibilityState: document.visibilityState }))
    addTrackedListener(window, 'beforeunload', () =>
      addEvent('beforeunload', { visibilityState: document.visibilityState })
    )
    addTrackedListener(window, 'error', (event) =>
      addEvent('console-error', { message: (event as ErrorEvent).message })
    )
    addTrackedListener(window, 'unhandledrejection', (event) =>
      addEvent('unhandledrejection', { message: String((event as PromiseRejectionEvent).reason) })
    )
  }

  function uninstallInstrumentation() {
    if (!instrumentationInstalled.value) {
      return
    }

    if (originalWindowOpen) {
      window.open = originalWindowOpen
    }
    if (originalNotificationRequestPermission) {
      Notification.requestPermission = originalNotificationRequestPermission
    }
    mutationObserver?.disconnect()

    for (const { target, type, handler, options } of trackedListeners) {
      target.removeEventListener(type, handler, options)
    }
    trackedListeners.length = 0

    instrumentationInstalled.value = false
  }

  onUnmounted(uninstallInstrumentation)

  function injectAdScript(scriptUrl: string) {
    const script = document.createElement('script')
    script.src = scriptUrl
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      status.value = 'script-loaded'
      addEvent('script-loaded', { url: scriptUrl })
    }
    script.onerror = () => {
      status.value = 'script-error'
      addEvent('script-error', { url: scriptUrl })
    }
    document.head.append(script)
  }

  function armAds() {
    if (armed.value) {
      return
    }

    armed.value = true
    status.value = 'armed'
    armedProviderMode.value = providerMode.value
    armedProviderLabel.value = selectedProviderLabel.value
    armedScriptUrl.value = selectedScriptUrl.value
    startedAt.value = new Date().toISOString()
    startedAtMs.value = performance.now()
    installInstrumentation()
    addEvent('armed', { label: armedProviderLabel.value, url: armedScriptUrl.value })
    injectAdScript(armedScriptUrl.value)
  }

  function recordTestClick(label: string) {
    clickCount.value += 1
    addEvent('test-click', { label })
  }

  async function runScriptedClickTest() {
    scriptedRunActive.value = true
    for (let index = 1; index <= 10; index += 1) {
      testTarget.value?.click()
      await new Promise((resolve) => window.setTimeout(resolve, 750))
    }
    scriptedRunActive.value = false
  }

  async function copyReportJson() {
    try {
      await navigator.clipboard.writeText(reportJson.value)
      status.value = 'report-copied'
    } catch {
      status.value = 'report-copy-failed'
    }
  }

  function clearReport() {
    status.value = armed.value ? 'armed' : 'idle'
    clickCount.value = 0
    events.value = []
  }
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-5 p-4 text-sm text-zinc-100 sm:p-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold">Push ad local evidence debug</h1>
      <p class="text-zinc-300">Local-only production debug page. Report stays in this browser until copied.</p>
    </header>

    <section class="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h2 class="mb-3 text-lg font-semibold">Provider</h2>
      <dl class="grid gap-2 break-all sm:grid-cols-[10rem_1fr]">
        <dt class="text-zinc-400">Selected</dt>
        <dd data-testid="selected-provider">{{ selectedProviderLabel }}</dd>
        <dt class="text-zinc-400">Mode</dt>
        <dd data-testid="selected-provider-mode">{{ providerMode }}</dd>
        <dt class="text-zinc-400">Script URL</dt>
        <dd data-testid="selected-script-url">{{ selectedScriptUrl }}</dd>
        <dt class="text-zinc-400">Status</dt>
        <dd data-testid="debug-status">{{ status }}</dd>
      </dl>
      <nav class="mt-4 flex flex-wrap gap-2">
        <template v-if="armed">
          <span
            v-for="mode in pushAdProviderModes"
            :key="mode"
            class="rounded border border-zinc-700 px-3 py-2 text-zinc-500"
            :data-testid="`provider-link-${mode}`"
          >
            {{ mode }}
          </span>
        </template>
        <template v-else>
          <NuxtLink
            v-for="mode in pushAdProviderModes"
            :key="mode"
            :to="{ path: route.path, query: { provider: mode } }"
            class="rounded border border-zinc-600 px-3 py-2 hover:bg-zinc-800"
            :data-testid="`provider-link-${mode}`"
          >
            {{ mode }}
          </NuxtLink>
        </template>
      </nav>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <button
        class="rounded bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
        :disabled="armed"
        @click="armAds"
      >
        Arm ads
      </button>
      <button
        ref="testTarget"
        class="min-h-28 rounded bg-sky-600 px-4 py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2 lg:col-span-2"
        :disabled="!armed"
        @click="recordTestClick('manual target click')"
      >
        Click test target
      </button>
      <button
        class="rounded bg-violet-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
        :disabled="!armed || scriptedRunActive"
        @click="runScriptedClickTest"
      >
        Run scripted click test
      </button>
      <div class="grid gap-3">
        <button
          class="rounded bg-zinc-700 px-4 py-3 font-semibold text-white"
          @click="copyReportJson"
        >
          Copy report JSON
        </button>
        <button
          class="rounded bg-zinc-700 px-4 py-3 font-semibold text-white"
          @click="clearReport"
        >
          Clear report
        </button>
      </div>
    </section>

    <section class="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h2 class="mb-3 text-lg font-semibold">Verdict</h2>
      <pre
        data-testid="debug-verdict"
        class="overflow-auto text-xs whitespace-pre-wrap"
        >{{ JSON.stringify(verdict, null, 2) }}</pre>
    </section>

    <section class="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h2 class="mb-3 text-lg font-semibold">Report JSON</h2>
      <pre
        data-testid="debug-report"
        class="max-h-[32rem] overflow-auto text-xs whitespace-pre-wrap"
        >{{ reportJson }}</pre>
    </section>
  </main>
</template>
