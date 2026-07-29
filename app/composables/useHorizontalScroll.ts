import { useEventListener } from '@vueuse/core'

export function useHorizontalScroll(elRef: Ref<HTMLElement | null>) {
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  useEventListener(elRef, 'mousedown', (e: MouseEvent) => {
    if (!elRef.value) return
    isDown = true
    elRef.value.classList.add('cursor-grabbing')
    elRef.value.classList.remove('cursor-grab')
    startX = e.pageX - elRef.value.offsetLeft
    scrollLeft = elRef.value.scrollLeft
  })

  useEventListener(elRef, 'mouseleave', () => {
    if (!elRef.value) return
    isDown = false
    elRef.value.classList.remove('cursor-grabbing')
    elRef.value.classList.add('cursor-grab')
  })

  useEventListener(elRef, 'mouseup', () => {
    if (!elRef.value) return
    isDown = false
    elRef.value.classList.remove('cursor-grabbing')
    elRef.value.classList.add('cursor-grab')
  })

  useEventListener(elRef, 'mousemove', (e: MouseEvent) => {
    if (!isDown || !elRef.value) return
    e.preventDefault()
    const x = e.pageX - elRef.value.offsetLeft
    const walk = (x - startX) * 2 // Scroll-fast
    elRef.value.scrollLeft = scrollLeft - walk
  })

  onMounted(() => {
    if (elRef.value) {
      elRef.value.classList.add('cursor-grab')
    }
  })
}
