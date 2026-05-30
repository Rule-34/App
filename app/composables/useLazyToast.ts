import { nextTick, watch, type Ref } from 'vue'

type Toast = (typeof import('vue-sonner'))['toast']

let toastPromise: Promise<Toast> | null = null

async function waitForToasterReady(isToasterReady: Ref<boolean>) {
  if (!import.meta.client || isToasterReady.value) {
    return
  }

  await new Promise<void>((resolve) => {
    const stop = watch(
      isToasterReady,
      (ready) => {
        if (!ready) {
          return
        }

        stop()
        resolve()
      },
      { immediate: true }
    )
  })
}

async function loadToast(shouldRenderToaster: Ref<boolean>, isToasterReady: Ref<boolean>) {
  toastPromise ??= import('vue-sonner')
    .then(({ toast }) => toast)
    .catch((error) => {
      toastPromise = null
      throw error
    })

  const toast = await toastPromise

  if (import.meta.client && !shouldRenderToaster.value) {
    isToasterReady.value = false
    shouldRenderToaster.value = true
    await nextTick()
  }

  await waitForToasterReady(isToasterReady)

  return toast
}

export function useLazyToast() {
  const shouldRenderToaster = useState('shouldRenderToaster', () => false)
  const isToasterReady = useState('isToasterReady', () => false)

  return {
    shouldRenderToaster,

    markToasterReady() {
      isToasterReady.value = true
    },

    markToasterUnmounted() {
      isToasterReady.value = false
      shouldRenderToaster.value = false
    },

    toast: {
      async error(...args: Parameters<Toast['error']>) {
        const toast = await loadToast(shouldRenderToaster, isToasterReady)
        return toast.error(...args)
      },

      async info(...args: Parameters<Toast['info']>) {
        const toast = await loadToast(shouldRenderToaster, isToasterReady)
        return toast.info(...args)
      },

      async success(...args: Parameters<Toast['success']>) {
        const toast = await loadToast(shouldRenderToaster, isToasterReady)
        return toast.success(...args)
      },

      async warning(...args: Parameters<Toast['warning']>) {
        const toast = await loadToast(shouldRenderToaster, isToasterReady)
        return toast.warning(...args)
      }
    }
  }
}
