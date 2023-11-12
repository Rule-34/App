<script lang='ts' setup>
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import { watchDebounced } from '@vueuse/core'
import { abbreviateNumber } from 'js-abbreviation-number'
import Tag from '~/assets/js/tag.dto'

const props = defineProps<{
	tagResults: Tag[]
}>()

const emit = defineEmits<{
	searchTag: [tag: string]

	submit: [payload: string | undefined]
}>()

const selectedTag = ref<Tag | undefined>()

watch(selectedTag, () => onSubmitted())

const searchQuery = ref('')

// Change event
function onComboboxInputChange(event: InputEvent) {
	let value = (event.target as HTMLInputElement).value

	value = value.trim()

	// Replace empty spaces with underscores
	value = value.replace(/\s/g, '_')

	searchQuery.value = value
}

watchDebounced(searchQuery, (value) => onSearchChange(value), { debounce: 350 })

function onSearchChange(tag: string) {
	tag = tag.trim()

	if (!tag || tag === '') {
		return
	}

	emit('searchTag', tag)
}

const customTagFromQuery = computed(() => {
	let tag = searchQuery.value

	if (!tag || tag === '') {
		return null
	}

	// If the tag is already in tagResults, return null
	if (props.tagResults.some((tagResult) => tagResult.name === tag)) {
		return null
	}

	return {
		name: tag,
		count: null
	}
})

function onSubmitted() {
	emit('submit', selectedTag.value?.name)
}
</script>

<template>
	<!--  Search & Actions -->
	<section>
		<!-- Search -->
		<!-- TODO: Use Float to fix transparency issues-->
		<Combobox v-model='selectedTag'>
			<div class='group relative'>
				<!-- Icon -->
				<div class='group pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md px-2'>
					<MagnifyingGlassIcon class='h-5 w-5 text-base-content group-hover:text-base-content-hover' />
				</div>

				<!-- Input -->
				<ComboboxInput
					:displayValue='(tag) => tag?.name'
					class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util w-full rounded-full border-0 bg-base-1000 px-9 py-2 text-base-content-highlight ring-1 ring-inset ring-base-0/20 sm:text-sm'
					placeholder='Search for tags: genshin_impact'
					@change='onComboboxInputChange'
				/>

				<!-- Button -->
				<ComboboxButton class='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2'>
					<ChevronUpDownIcon class='h-5 w-5 text-base-content group-hover:text-base-content-hover' />
				</ComboboxButton>

				<!-- Options -->
				<ComboboxOptions
					class='absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-md bg-base-1000 py-1 text-base ring-1 ring-base-0/20 sm:text-sm'
				>
					<!-- Custom option -->
					<!-- TODO: History based -->
					<!-- TODO: Basic common queries, e.g. minecraft, brawl_stars, etc. -->
					<ComboboxOption
						v-if='customTagFromQuery'
						v-slot='{ active, selected }'
						:value='customTagFromQuery'
					>
						<div
							:class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
							class='relative cursor-default select-none py-2 pl-8'
						>
              <span :class="['block truncate', selected && 'font-semibold']">
                Create “{{ customTagFromQuery.name }}” tag
              </span>

							<span
								v-if='selected'
								class='absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight'
							>
                <CheckIcon class='h-5 w-5' />
              </span>
						</div>
					</ComboboxOption>

					<!-- Options -->
					<ComboboxOption
						v-for='tag in tagResults'
						:key='tag.name'
						v-slot='{ active, selected }'
						:value='tag'
					>
						<div
							:class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
							class='relative cursor-default select-none py-2 pl-8 pr-12'
						>
							<!-- Check icon -->
							<span
								v-if='selected'
								class='absolute inset-y-0 left-0 flex items-center pl-1.5 text-base-content-highlight'
							>
                <CheckIcon class='h-5 w-5' />
              </span>

							<!-- Tag -->
							<span :class="['block truncate', selected && 'font-semibold']">
                {{ tag.name }}
              </span>

							<!-- Tag count -->
							<div class='absolute inset-y-0 right-0 flex items-center gap-2 pr-4'>
                <span v-if='tag.count'>
                  {{ abbreviateNumber(tag.count, 0) }}
                </span>
							</div>
						</div>
					</ComboboxOption>
				</ComboboxOptions>
			</div>
		</Combobox>
	</section>
</template>
