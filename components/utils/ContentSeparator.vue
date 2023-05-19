<template>
	<div class="">
		<!-- Head -->
		<h1 class="text-base-content-highlight text-2xl font-bold tracking-wide leading-10">{{ title }}</h1>

		<!-- Body -->
		<p
			v-if="text"
			class="text-base-content"
		>
			{{ text }}
		</p>
	</div>
</template>

<script>
export default {
	props: {
		title: { type: String, required: true },
		text: { type: String, required: false, default: undefined }
	}
}
</script>
