<script>
export default {
	inheritAttrs: false
}
</script>

<script setup>
import { SwitchGroup, SwitchLabel } from '@headlessui/vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
	<div class="flex gap-2 flex-row items-center justify-between">
		<!-- TODO: Generate random label ID -->
		<label class="flex flex-grow flex-col">
			<span class="text-base-content-highlight font-medium leading-8">
				<slot name="name" />
			</span>

			<span class="text-sm text-base-content">
				<slot name="description" />
			</span>
		</label>

		<input
			:value="modelValue"
			class="focus-visible:focus-util w-12 h-6 rounded-full border-2 border-base-0/20 text-base-content-highlight bg-inherit px-2 text-center"
			min="0"
			type="number"
			v-bind="$attrs"
			@input="$emit('update:modelValue', $event.target.value)"
		/>
	</div>
</template>
