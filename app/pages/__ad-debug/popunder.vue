<script setup lang="ts">
import {
  getPopunderProviderByKey,
  parsePopunderProviderMode,
  popunderProviderModes,
  popunderProviders,
  selectRandomPopunderProviderScript,
  type PopunderProviderKey
} from '~/composables/useAdvertisements'
import {
  createPopunderDebugReport,
  createPopunderDebugVerdict,
  type PopunderDebugEvent,
  type PopunderDebugEventType
} from '~/assets/js/advertising/popunder-debug-report'

useSeoMeta({
  robots: 'noindex, nofollow',
  title: 'Popunder local evidence debug'
})

const route = useRoute()
const testTarget = useTemplateRef<HTMLButtonElement>('testTarget')

const providerMode = computed(() => parsePopunderProviderMode(route.query.provider))
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
const events = ref<PopunderDebugEvent[]>([])
const scriptedRunActive = ref(false)

const selectedProvider = computed(() => {
  if (providerMode.value !== 'random') {
    return getPopunderProviderByKey(providerMode.value as PopunderProviderKey)
  }

  return popunderProviders.find((provider) => provider.id === selectedRandomScript.value) ?? getPopunderProviderByKey('hilltop')
})
const selectedProviderLabel = computed(() =>
  providerMode.value === 'random' ? `Random (${selectedProvider.value.label})` : selectedProvider.value.label
)
const selectedScriptUrl = computed(() => (providerMode.value === 'random' ? selectedRandomScript.value : selectedProvider.value.id))
const reportProviderMode = computed(() => (armed.value ? armedProviderMode.value : providerMode.value))
const reportProviderLabel = computed(() => (armed.value ? armedProviderLabel.value : selectedProviderLabel.value))
const reportScriptUrl = computed(() => (armed.value ? armedScriptUrl.value : selectedScriptUrl.value))
const verdict = computed(() => createPopunderDebugVerdict(events.value))
const reportJson = computed(() => {
  if (!clientMounted.value) {
    return ''
  }

  return createPopunderDebugReport({
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

    selectedRandomScript.value = providerMode.value === 'random' ? selectRandomPopunderProviderScript() : ''
    clearReport()
  },
  { immediate: true }
)

function elapsedMs() {
  return startedAtMs.value ? Math.max(0, Math.round(performance.now() - startedAtMs.value)) : 0
}

function addEvent(type: PopunderDebugEventType, details: Partial<PopunderDebugEvent> = {}) {
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
let originalLocationAssign: Location['assign'] | null = null
let originalLocationReplace: Location['replace'] | null = null
const trackedListeners: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean }[] = []

function addTrackedListener(target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: boolean) {
  target.addEventListener(type, handler, options)
  trackedListeners.push({ target, type, handler, options })
}

function tryPatchLocationMethod(method: 'assign' | 'replace', eventType: 'location-assign' | 'location-replace') {
  const original = window.location[method].bind(window.location)

  try {
    window.location[method] = ((url: string | URL) => {
      addEvent(eventType, { url: String(url), stack: getStack() })
      return original(url)
    }) as Location[typeof method]

    if (method === 'assign') {
      originalLocationAssign = original
    } else {
      originalLocationReplace = original
    }
  } catch (error) {
    addEvent('instrumentation-failure', { message: `location.${method} instrumentation failed: ${String(error)}` })
  }
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

  tryPatchLocationMethod('assign', 'location-assign')
  tryPatchLocationMethod('replace', 'location-replace')

  addTrackedListener(
    document,
    'click',
    (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[target="_blank"]') : null
      if (anchor instanceof HTMLAnchorElement) {
        addEvent('anchor-blank-click', { url: anchor.href, target: anchor.target, stack: getStack() })
      }
    },
    true
  )

  addTrackedListener(document, 'visibilitychange', () => addEvent('visibilitychange', { visibilityState: document.visibilityState }))
  addTrackedListener(window, 'pagehide', () => addEvent('pagehide'))
  addTrackedListener(window, 'beforeunload', () => addEvent('beforeunload'))
  addTrackedListener(window, 'error', (event) => addEvent('console-error', { message: (event as ErrorEvent).message }))
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
  if (originalLocationAssign) {
    window.location.assign = originalLocationAssign
  }
  if (originalLocationReplace) {
    window.location.replace = originalLocationReplace
  }

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
  await navigator.clipboard.writeText(reportJson.value)
  status.value = 'report-copied'
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
      <h1 class="text-2xl font-semibold">Popunder local evidence debug</h1>
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
            v-for="mode in popunderProviderModes"
            :key="mode"
            class="rounded border border-zinc-700 px-3 py-2 text-zinc-500"
            :data-testid="`provider-link-${mode}`"
          >
            {{ mode }}
          </span>
        </template>
        <template v-else>
          <NuxtLink
            v-for="mode in popunderProviderModes"
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
        <button class="rounded bg-zinc-700 px-4 py-3 font-semibold text-white" @click="copyReportJson">
          Copy report JSON
        </button>
        <button class="rounded bg-zinc-700 px-4 py-3 font-semibold text-white" @click="clearReport">Clear report</button>
      </div>
    </section>

    <section class="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h2 class="mb-3 text-lg font-semibold">Verdict</h2>
      <pre data-testid="debug-verdict" class="overflow-auto whitespace-pre-wrap text-xs">{{ JSON.stringify(verdict, null, 2) }}</pre>
    </section>

    <section class="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <h2 class="mb-3 text-lg font-semibold">Report JSON</h2>
      <pre data-testid="debug-report" class="max-h-[32rem] overflow-auto whitespace-pre-wrap text-xs">{{ reportJson }}</pre>
    </section>
  </main>
</template>
