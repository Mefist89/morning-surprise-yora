<script lang="ts">
	import { onMount } from 'svelte';
	import { currentScene } from '$lib/store';
	import { config } from '$lib/config';
	import { gsap } from 'gsap';
	import { audioController } from '$lib/audio';

	let container: HTMLElement;
	let bg1: HTMLImageElement;
	let bg2: HTMLImageElement;
	let button: HTMLButtonElement;
	let textElement: HTMLElement;
	let ticketElement: HTMLElement;
	
	let step = 1;
	let currentText = $state('');

	const stars = Array.from({ length: 150 }, () => ({
		top: Math.random() * 100,
		left: Math.random() * 100,
		size: Math.random() * 2 + 1,
		delay: Math.random() * 5,
		duration: Math.random() * 3 + 2
	}));

	onMount(() => {
		// Initial setup
		gsap.set(bg1, { opacity: 0 });
		gsap.set(bg2, { opacity: 0 });
		gsap.set(button, { opacity: 0, y: 20 });
		gsap.set(textElement, { opacity: 0, y: 10 });

		// Transition 1: Fade in ocean and then start typewriter
		gsap.to(bg1, { opacity: 1, duration: 2, ease: 'power2.inOut', onComplete: () => {
			gsap.to(textElement, { opacity: 1, y: 0, duration: 0.5 });
			showTypewriterText();
		}});

		// Preload audio
		audioController.init();
		audioController.waves?.play();
	});

	function showTypewriterText() {
		const text = config.scenes.intro.text1;
		if (!text) return;
		currentText = '';
		let i = 0;
		const interval = setInterval(() => {
			if (i < text.length) {
				currentText += text.charAt(i);
				i++;
			} else {
				clearInterval(interval);
				// Show button after text finishes
				gsap.to(button, { opacity: 1, y: 0, duration: 1.5, ease: 'back.out(1.7)' });
			}
		}, 70); // 70ms per letter for romantic pace
	}

	function handleAction() {
		if (step === 1) {
			// Transition to step 2
			step = 2;
			
			// Crossfade backgrounds
			gsap.to(bg1, { opacity: 0, duration: 1.5, ease: 'power1.inOut' });
			gsap.to(bg2, { opacity: 1, duration: 1.5, ease: 'power1.inOut' });
			
			// Fade out text and show ticket
			gsap.to(textElement, { opacity: 0, y: -10, duration: 1, onComplete: () => {
				textElement.style.display = 'none';
				ticketElement.classList.remove('hidden');
				gsap.set(ticketElement, { opacity: 0, y: 30 });
				gsap.to(ticketElement, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' });
			}});
			
			// Button animation
			gsap.to(button, { opacity: 0, y: -10, duration: 0.5, onComplete: () => {
				// The text updates automatically via Svelte reactivity
				gsap.set(button, { y: 20 });
				gsap.to(button, { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)' });
			}});
			
		} else if (step === 2) {
			// Transition 2: Dive in
			gsap.to(button, { opacity: 0, duration: 0.5, onComplete: () => button.style.display = 'none' });
			gsap.to(ticketElement, { opacity: 0, scale: 0.9, duration: 1 });
			
			audioController.mainTheme?.play();
			audioController.mainTheme?.fade(0, 1, 2000);

			// Zoom in and fade to black
			gsap.to(bg2, { scale: 1.5, duration: 3, ease: 'power1.inOut' });
			gsap.to(container, {
				opacity: 0,
				duration: 2,
				delay: 1,
				onComplete: () => {
					$currentScene = 1;
				}
			});
		}
	}
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full flex items-center justify-center">
	<img bind:this={bg1} src={config.scenes.intro.background1} alt="Ocean 1" class="absolute inset-0 w-full h-full object-cover origin-center" />
	<img bind:this={bg2} src={config.scenes.intro.background2} alt="Ocean 2" class="absolute inset-0 w-full h-full object-cover origin-center" />
	
	<!-- Darkening Overlay (30%) -->
	<div class="absolute inset-0 bg-black/30 z-[1]"></div>
	
	<!-- Twinkling Stars Overlay -->
	<div class="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
		{#each stars as star}
			<div 
				class="absolute bg-white rounded-full animate-twinkle"
				style="top: {star.top}%; left: {star.left}%; width: {star.size}px; height: {star.size}px; animation-delay: {star.delay}s; animation-duration: {star.duration}s;"
			></div>
		{/each}
	</div>
	
	<div class="relative z-10 flex flex-col items-center gap-12">
		<p bind:this={textElement} class="text-4xl md:text-6xl italic font-normal tracking-wide text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-center px-4 max-w-4xl leading-relaxed" style="font-family: 'Cormorant Garamond', serif; min-height: 5rem;">
			{currentText}
		</p>
		
		<!-- Vintage Titanic Ticket -->
		<div bind:this={ticketElement} class="hidden opacity-0 flex shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden transform hover:scale-105 transition-transform duration-500">
			<!-- Ticket Body -->
			<div class="bg-[#FDF6E3] w-[280px] md:w-[450px] p-4 md:p-6 border-r-2 border-dashed border-gray-400 relative">
				<div class="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-1">White Star Line</div>
				<div class="text-3xl md:text-5xl font-bold text-gray-900 mb-4" style="font-family: 'Cormorant Garamond', serif;">R.M.S. TITANIC</div>
				
				<div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
					<div>
						<div class="text-gray-500 text-[10px] md:text-xs uppercase">Passenger</div>
						<div class="font-bold text-base md:text-lg text-gray-900" style="font-family: 'Cormorant Garamond', serif;">Yora & Eugen</div>
					</div>
					<div>
						<div class="text-gray-500 text-[10px] md:text-xs uppercase">Date</div>
						<div class="font-bold text-base md:text-lg text-gray-900" style="font-family: 'Cormorant Garamond', serif;">{new Date().toLocaleDateString('ru-RU')}</div>
					</div>
					<div>
						<div class="text-gray-500 text-[10px] md:text-xs uppercase">Class</div>
						<div class="font-bold text-base md:text-lg text-gray-900" style="font-family: 'Cormorant Garamond', serif;">First Class</div>
					</div>
					<div>
						<div class="text-gray-500 text-[10px] md:text-xs uppercase">Destination</div>
						<div class="font-bold text-base md:text-lg text-gray-900 italic" style="font-family: 'Cormorant Garamond', serif;">Бесконечность</div>
					</div>
				</div>
			</div>
			<!-- Ticket Stub -->
			<div class="bg-[#FDF6E3] w-[60px] md:w-[100px] p-2 md:p-4 flex flex-col justify-center items-center relative">
				<!-- Vintage barcode/serial -->
				<div class="absolute top-4 right-2 md:right-4 text-[8px] md:text-[10px] text-gray-400 transform rotate-90 origin-right">No. 08154</div>
				<div class="text-lg md:text-2xl font-bold text-gray-900 transform -rotate-90 tracking-[0.3em] whitespace-nowrap" style="font-family: 'Cormorant Garamond', serif;">
					BOARDING
				</div>
			</div>
		</div>
		
		<button 
			bind:this={button} 
			onclick={handleAction}
			class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xl tracking-widest uppercase transition-colors cursor-pointer"
		>
			{#if step === 1}
				{config.scenes.intro.buttonText1}
			{:else}
				{config.scenes.intro.buttonText2}
			{/if}
		</button>
	</div>
</div>

<style>
	@keyframes twinkle {
		0%, 100% { opacity: 0; transform: scale(0.5); }
		50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.4); }
	}
	.animate-twinkle {
		animation: twinkle infinite ease-in-out;
	}
</style>
