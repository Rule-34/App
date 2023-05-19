<script>
export default {
	inheritAttrs: false
}
</script>

<script setup>
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
	<SwitchGroup
		as="div"
		class="flex flex-row items-center gap-2 justify-between"
	>
		<span class="flex flex-grow flex-col">
			<SwitchLabel
				as="span"
				class="text-base-content-highlight font-medium leading-8"
				passive
			>
				<slot name="name" />
			</SwitchLabel>

			<SwitchDescription
				as="span"
				class="text-sm text-base-content"
			>
				<slot name="description" />
			</SwitchDescription>
		</span>

		<Switch
			:modelValue="modelValue"
			class="ui-checked:bg-primary-700 ui-not-checked:bg-base-1000 relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-base-800 transition-colors duration-200 ease-in-out focus-visible:focus-util"
			@update:modelValue="emit('update:modelValue', $event)"
		>
			<span
				aria-hidden="true"
				class="ui-checked:translate-x-6 ui-not-checked:translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-base-content-highlight shadow ring-0 transition duration-200 ease-in-out"
			/>
		</Switch>
	</SwitchGroup>
</template>
