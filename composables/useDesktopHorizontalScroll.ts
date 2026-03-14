import { useEventListener } from '@vueuse/core'
import type { Ref } from 'vue'

const DRAG_THRESHOLD = 4

export function useDesktopHorizontalScroll<T extends HTMLElement>(scrollContainerRef: Ref<T | null>) {
  let activePointerId: number | null = null
  let dragStartX = 0
  let dragStartScrollLeft = 0
  let didDrag = false
  let shouldPreventClick = false

  function onWheel(event: WheelEvent) {
    const scrollContainer = scrollContainerRef.value

    if (!scrollContainer) {
      return
    }

    // Preserve touchpad/native horizontal behavior and only map normal mouse wheel.
    if (event.deltaX !== 0 || event.deltaY === 0 || !isLikelyMouseWheel(event)) {
      return
    }

    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth

    if (maxScrollLeft <= 0) {
      return
    }

    const canScrollLeft = scrollContainer.scrollLeft > 0
    const canScrollRight = scrollContainer.scrollLeft < maxScrollLeft

    if ((event.deltaY < 0 && !canScrollLeft) || (event.deltaY > 0 && !canScrollRight)) {
      return
    }

    event.preventDefault()

    scrollContainer.scrollLeft += event.deltaY
  }

  function onPointerDown(event: PointerEvent) {
    const scrollContainer = scrollContainerRef.value

    if (!scrollContainer || event.pointerType !== 'mouse' || event.button !== 0) {
      return
    }

    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth

    if (maxScrollLeft <= 0) {
      return
    }

    activePointerId = event.pointerId
    dragStartX = event.clientX
    dragStartScrollLeft = scrollContainer.scrollLeft
    didDrag = false

    scrollContainer.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    const scrollContainer = scrollContainerRef.value

    if (!scrollContainer || activePointerId !== event.pointerId) {
      return
    }

    const dragDistance = event.clientX - dragStartX

    if (!didDrag && Math.abs(dragDistance) >= DRAG_THRESHOLD) {
      didDrag = true
    }

    if (!didDrag) {
      return
    }

    event.preventDefault()

    scrollContainer.scrollLeft = dragStartScrollLeft - dragDistance
  }

  function endDrag(event: PointerEvent) {
    const scrollContainer = scrollContainerRef.value

    if (!scrollContainer || activePointerId !== event.pointerId) {
      return
    }

    if (scrollContainer.hasPointerCapture(event.pointerId)) {
      scrollContainer.releasePointerCapture(event.pointerId)
    }

    shouldPreventClick = didDrag
    didDrag = false
    activePointerId = null
  }

  function onClickCapture(event: MouseEvent) {
    if (!shouldPreventClick) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    shouldPreventClick = false
  }

  useEventListener(scrollContainerRef, 'wheel', onWheel, { passive: false })
  useEventListener(scrollContainerRef, 'pointerdown', onPointerDown)
  useEventListener(scrollContainerRef, 'pointermove', onPointerMove)
  useEventListener(scrollContainerRef, 'pointerup', endDrag)
  useEventListener(scrollContainerRef, 'pointercancel', endDrag)
  useEventListener(scrollContainerRef, 'click', onClickCapture, { capture: true })
}

function isLikelyMouseWheel(event: WheelEvent) {
  if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
    return true
  }

  return Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 40
}
