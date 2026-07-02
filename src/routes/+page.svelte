<script lang="ts">
	import { currentScene } from '$lib/store';
	import Scene0Intro from '$lib/components/Scene0_Intro.svelte';
	import Scene1Cabin from '$lib/components/Scene1_Cabin.svelte';
	import Scene2Cinema from '$lib/components/Scene2_Cinema.svelte';
	import Scene3Reality from '$lib/components/Scene3_Reality.svelte';
	import Scene4Outro from '$lib/components/Scene4_Outro.svelte';
</script>

<svelte:head>
	<title>Surprise Yora</title>
</svelte:head>

<main class="w-screen h-screen overflow-hidden bg-black relative">
	{#if $currentScene === 'intro'}
		<Scene0Intro />
	{:else if $currentScene === 1}
		<Scene1Cabin />
	{:else if $currentScene === 2}
		<Scene2Cinema />
	{:else if $currentScene === 3}
		<Scene3Reality />
	{:else if $currentScene === 'outro'}
		<Scene4Outro />
	{/if}
</main>
