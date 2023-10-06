<script lang='ts' setup>
import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
import Slideover from '~/components/layout/Slideover.vue'
import { booruTypeList } from 'assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { Ref } from 'vue'
import { toast } from 'vue-sonner'

const { booruList, resetBooruList } = useBooruList()

const sortableElement = ref<HTMLElement | null>(null)

useSortable(sortableElement, booruList, {
	handle: '.handle',
	animation: 150,

	onUpdate: (e: any) => {

		nextTick(() => {
			moveArrayElement(booruList.value, e.oldIndex, e.newIndex)
		})
	}
})

const dialogOpen = ref(false)

type dialogModes = 'create' | 'update'

const dialogEditIndex: Ref<number | null> = ref(null)
const dialogMode: ComputedRef<dialogModes> = computed(() => {
	if (dialogEditIndex.value !== null) {
		return 'update'
	}

	return 'create'
})

const currentBooru: Ref<{
	domain: string | undefined
	type: string | undefined
}> = ref({
	domain: undefined,
	type: undefined
})

function resetBooruListToDefault() {
	if (!confirm('Are you sure you want to reset all Boorus to default?')) {
		return
	}

	resetBooruList()
}

function openCreateBooruDialog() {
	currentBooru.value = {
		domain: undefined,
		type: undefined
	}

	dialogEditIndex.value = null
	dialogOpen.value = true
}

function openEditBooru(index: number) {
	const booru = booruList.value[index]

	currentBooru.value = {
		domain: booru.domain,
		type: booru.type.type
	}

	dialogEditIndex.value = index
	dialogOpen.value = true
}

function onFormSubmit() {
	if (dialogMode.value === 'create') {
		createBooru()
	} else {
		editBooru()
	}
}

function createBooru() {

	// Validations
	if (!currentBooru.value.domain || !currentBooru.value.type) {
		toast.error('Please fill out all fields')
		return
	}

	const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

	if (!booruType) {
		toast.error('Invalid Booru type')
		return
	}

	// TODO: Validate with Domain object

	if (booruList.value.find((booruFromList) => booruFromList.domain === currentBooru.value.domain)) {
		toast.error('Booru already exists')
		return
	}

	booruList.value.push({
		domain: currentBooru.value.domain,
		type: booruType,
		isPremium: true
	})

	dialogOpen.value = false
}

function editBooru() {

	// Validations
	if (!currentBooru.value.domain || !currentBooru.value.type) {
		toast.error('Please fill out all fields')
		return
	}

	const booruType = booruTypeList.find((booruType) => booruType.type === currentBooru.value.type)

	if (!booruType) {
		toast.error('Invalid Booru type')
		return
	}

	// TODO: Validate with Domain object

	booruList.value[dialogEditIndex.value!] = {
		domain: currentBooru.value.domain,
		type: booruType,
		isPremium: true
	}

	dialogOpen.value = false
}

function deleteBooru() {
	booruList.value.splice(dialogEditIndex.value!, 1)

	dialogOpen.value = false
}

useSeoMeta({
	title: 'Additional Boorus'
})
</script>

<template>
	<main class='container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8'>
		<PageHeader>
			<template #title>Additional Boorus</template>
			<template #text> Add and edit compatible Boorus</template>
		</PageHeader>

		<section class='mx-2 mt-4 flex-auto'>
			<ol
				ref='sortableElement'
				class='space-y-4'
			>
				<li
					v-for='(booru, index) in booruList'
					:key='booru.domain'
					class='flex w-full items-center gap-2'
				>
					<!-- Handle -->
					<div class='handle mr-2 cursor-move'>
						<span class='sr-only'>Drag to reorder</span>

						<Bars2Icon class='h-4 w-4 text-base-content group-hover:text-base-content-hover' />
					</div>

					<!-- Favicon -->
					<img
						:src='`https://www.google.com/s2/favicons?domain=${booru.domain}&sz=128`'
						alt='Favicon'
						class='h-5 w-5 flex-shrink-0 rounded'
						height='128'
						loading='lazy'
						width='128'
					/>

					<!-- Domain -->
					<span class=''>
            {{ booru.domain }}
          </span>

					<!-- Take space -->
					<div class='flex-1' />

					<!-- Actions -->
					<div class='flex gap-2'>
						<!-- Edit -->
						<button
							class='hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2'
							type='button'
							@click='openEditBooru(index)'
						>
							<span class='sr-only'>Edit</span>
							<PencilIcon class='h-4 w-4' />
						</button>
					</div>
				</li>
			</ol>
		</section>

		<!-- Actions -->
		<section class='mt-4 flex items-center justify-between gap-2'>
			<!-- Reset to default -->
			<button
				class='hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1'
				type='button'
				@click='resetBooruListToDefault'
			>
				<ArrowUturnLeftIcon class='mr-2 h-4 w-4' />

				Reset to default
			</button>

			<!-- Add Booru -->
			<button
				class='hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1'
				type='button'
				@click='openCreateBooruDialog'
			>
				Add Booru

				<PlusIcon class='ml-2 mr-2 h-4 w-4' />
			</button>
		</section>
	</main>

	<!-- Booru Dialog -->
	<Slideover
		:is-open='dialogOpen'
		@close='dialogOpen = false'
	>
		<template #title>
			{{ dialogMode === 'create' ? 'Add' : 'Edit' }} Booru
		</template>

		<template #description>
			Remember to test the Booru before saving it
		</template>

		<div class='divide-y divide-gray-200 px-4 sm:px-6'>
			<!-- Form -->
			<form
				id='booru-create-form'
				class='space-y-6 pb-5 pt-6'
				@submit.prevent='onFormSubmit'
			>
				<!-- Domain -->
				<div>
					<label
						class='block font-medium leading-8 text-base-content-highlight'
						for='domain'
					>
						Domain
					</label>

					<div class='mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-base-0/20'>
						<span class='inline-flex items-center px-3 sm:text-sm'>https://</span>

						<input
							id='domain'
							v-model='currentBooru.domain'
							aria-describedby='domain-description'
							class='hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util flex-auto rounded-r-md border-base-0/20 bg-base-1000 px-2 py-1.5 sm:text-sm sm:leading-6'
							name='domain'
							pattern='[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}'
							required
							type='text'
						/>
					</div>

					<p
						id='domain-description'
						class='mt-2 text-sm'
					>
						Only the domain. Not the full URL
					</p>
				</div>

				<!-- Booru Type -->
				<div>
					<label
						class='block text-sm font-medium leading-8 text-base-content-highlight'
						for='type'
					>
						Type
					</label>

					<select
						id='type'
						v-model='currentBooru.type'
						aria-describedby='type-description'
						class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mt-2 block w-full rounded-md border-base-0/20 bg-base-1000 py-1.5 pl-3 pr-10 sm:text-sm sm:leading-6'
						name='type'
						required
					>
						<option
							v-for='type in booruTypeList'
							:value='type.type'
						>
							{{ type.type }}
						</option>
					</select>

					<p
						id='type-description'
						class='mt-2 text-sm'
					>
						Usually found at the bottom of a Booru's website

						<span class='mt-2 block text-xs italic'>
                If the type is equal to the domain, choose that option
              </span>
					</p>
				</div>
			</form>
		</div>

		<template #actions>
			<button
				v-if='dialogMode === "update"'
				class='focus-visible:focus-outline-util mr-auto hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20'
				type='button'
				@click='deleteBooru'
			>
				Delete
			</button>

			<button
				class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20'
				type='button'
			>
				Test Booru
			</button>

			<button
				class='focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20'
				form='booru-create-form'
				type='submit'
			>
				{{ dialogMode === 'create' ? 'Add' : 'Save' }}
			</button>
		</template>
	</Slideover>
</template>
