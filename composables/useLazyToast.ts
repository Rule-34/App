import { nextTick, type Ref } from 'vue'

type Toast = (typeof import('vue-sonner'))['toast']

let toastPromise: Promise<Toast> | null = null

async function loadToast(shouldRenderToaster: Ref<boolean>) {
  toastPromise ??= import('vue-sonner')
    .then(({ toast }) => toast)
    .catch((error) => {
      toastPromise = null
      throw error
    })

  const toast = await toastPromise

  if (import.meta.client && !shouldRenderToaster.value) {
    shouldRenderToaster.value = true
    await nextTick()
  }

  return toast
}

export function useLazyToast() {
  const shouldRenderToaster = useState('shouldRenderToaster', () => false)

  return {
    shouldRenderToaster,

    toast: {
      async error(...args: Parameters<Toast['error']>) {
        const toast = await loadToast(shouldRenderToaster)
        return toast.error(...args)
      },

      async info(...args: Parameters<Toast['info']>) {
        const toast = await loadToast(shouldRenderToaster)
        return toast.info(...args)
      },

      async success(...args: Parameters<Toast['success']>) {
        const toast = await loadToast(shouldRenderToaster)
        return toast.success(...args)
      },

      async warning(...args: Parameters<Toast['warning']>) {
        const toast = await loadToast(shouldRenderToaster)
        return toast.warning(...args)
      }
    }
  }
}
