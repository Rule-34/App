type VirtualizerMeasurementTarget = {
  measureElement: (element: Element | null) => void
}

export function measureVirtualItemsAfterVueUpdate(params: {
  elements: Array<Element | null>
  virtualizer: VirtualizerMeasurementTarget
}) {
  const { elements, virtualizer } = params

  virtualizer.measureElement(null)

  for (const element of elements) {
    if (element?.isConnected) {
      virtualizer.measureElement(element)
    }
  }
}
