<script lang="ts">
	export let title: string;
	export let description: string;
	export let id: string;
</script>

<a
	href="/subproject/{id}"
	class="block rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-colors duration-200 hover:bg-gray-100"
>
	<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">{title}</h5>
	<p class="font-normal text-gray-700">{description}</p>
</a>
