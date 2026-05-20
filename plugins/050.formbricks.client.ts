import { defineNuxtPlugin } from '#imports'
import { useIdleTask } from '~/composables/useIdleTask'
import { project } from '@/config/project'

export default defineNuxtPlugin({
  parallel: true,
  setup() {
    const router = useRouter()
    const analytics = project.analytics

    if (!analytics?.formbricksEnvironmentId || !analytics?.formbricksAppUrl) {
      return
    }

    const { formbricksEnvironmentId, formbricksAppUrl } = analytics
    let formbricksInstance: (typeof import('@formbricks/js'))['default'] | null = null

    router.afterEach(() => {
      if (formbricksInstance) {
        void formbricksInstance.registerRouteChange()
      }
    })

    const { hasInteracted } = useInteractionDetector()
    const { schedule } = useIdleTask()

    const stop = watch(
      hasInteracted,
      (hasInteracted) => {
        if (hasInteracted) {
          schedule(() => {
            void loadFormbricks()
          })
          stop()
        }
      },
      { flush: 'post', immediate: true }
    )

    async function loadFormbricks() {
      if (formbricksInstance) {
        return
      }

      const { default: formbricks } = await import('@formbricks/js')
      formbricksInstance = formbricks

      await formbricksInstance.setup({
        environmentId: formbricksEnvironmentId,
        appUrl: formbricksAppUrl
      })
    }
  }
})
