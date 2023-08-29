<script lang='ts' setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
	isOpen: boolean
}>()

const emit = defineEmits<{
	close: []
}>()

</script>

<template>
	<TransitionRoot
		:show='isOpen'
		as='template'
	>
		<Dialog
			as='div'
			class='relative z-10'
			@close='emit("close")'
		>
			<!-- Overlay -->
			<TransitionChild
				as='template'
				enter='ease-in-out duration-300'
				enter-from='opacity-0'
				enter-to='opacity-100'
				leave='ease-in-out duration-300'
				leave-from='opacity-100'
				leave-to='opacity-0'
			>
				<div class='fixed inset-0 bg-base-1000/80 backdrop-blur transition-opacity' />
			</TransitionChild>

			<div class='fixed inset-0 overflow-hidden'>
				<div class='absolute inset-0 overflow-hidden'>
					<div class='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
						<TransitionChild
							as='template'
							enter='transform transition ease-in-out duration-300'
							enter-from='translate-x-full'
							enter-to='translate-x-0'
							leave='transform transition ease-in-out duration-300'
							leave-from='translate-x-0'
							leave-to='translate-x-full'
						>
							<DialogPanel class='pointer-events-auto relative w-screen max-w-md'>
								<!-- Close Button -->
								<TransitionChild
									as='template'
									enter='ease-in-out duration-300'
									enter-from='opacity-0'
									enter-to='opacity-100'
									leave='ease-in-out duration-300'
									leave-from='opacity-100'
									leave-to='opacity-0'
								>
									<div class='absolute left-0 top-0 -ml-9 flex pr-2 pt-4 sm:-ml-10 sm:pr-4'>
										<button
											class='focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util relative rounded-md p-1'
											type='button'
											@click='emit("close")'
										>
											<span class='absolute -inset-2.5' />

											<span class='sr-only'> Close panel </span>

											<XMarkIcon
												aria-hidden='true'
												class='h-6 w-6'
											/>
										</button>
									</div>
								</TransitionChild>

								<!-- Sidebar -->
								<div
									class='flex h-full flex-col bg-base-1000 shadow-xl ring-1 ring-base-0/10'
								>
									<!-- Header -->
									<div
										v-if='$slots.title && $slots.description'
										class='h-0 flex-1 overflow-y-auto'
									>
										<div class='px-4 py-6 sm:px-6'>

											<!-- Title -->
											<DialogTitle class='text-xl font-semibold leading-8 text-base-content-highlight'>
												<slot name='title' />
											</DialogTitle>

											<!-- Description -->
											<div v-if='$slots.description' class='mt-1'>
												<p class='text-sm'>
													<slot name='description' />
												</p>
											</div>
										</div>

										<!-- Content -->
										<div class='flex flex-1 flex-col justify-between'>
											<slot />
										</div>
									</div>

									<!-- Footer -->
									<!-- Actions -->
									<div class='flex flex-shrink-0 justify-end gap-4 px-4 py-4'>
										<slot name='actions' />
									</div>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>
