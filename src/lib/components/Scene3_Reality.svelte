<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentScene } from '$lib/store';
	import { config } from '$lib/config';
	import { gsap } from 'gsap';

	let container: HTMLElement;
	let bg1: HTMLImageElement;
	let bg2: HTMLImageElement;
	let bg3: HTMLImageElement;
	let textBlock: HTMLElement;
	let nextButton: HTMLButtonElement;
	
	let step = 1;
	let currentText = $state('');
	let typewriterInterval: ReturnType<typeof setInterval>;

	const sceneConfig = config.scenes.reality;

	onMount(() => {
		// Initial setup
		gsap.set(container, { opacity: 0 });
		gsap.set([bg2, bg3], { opacity: 0 });
		gsap.set(textBlock, { opacity: 0, scale: 0.95, display: 'none' });
		
		// 1. Fade in scene
		gsap.to(container, { opacity: 1, duration: 2, onComplete: () => {
			// Show first text block
			gsap.to(textBlock, { display: 'flex', opacity: 1, scale: 1, duration: 1, ease: 'power2.out', onComplete: () => {
				typeText(sceneConfig.text1, () => {
					gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
				});
			}});
		}});
		
		// Slow zoom on bg1
		gsap.to(bg1, { scale: 1.05, duration: 25, ease: 'none' });
	});

	function typeText(text: string, onComplete?: () => void) {
		currentText = '';
		let i = 0;
		if (typewriterInterval) clearInterval(typewriterInterval);
		
		typewriterInterval = setInterval(() => {
			if (i < text.length) {
				currentText += text.charAt(i);
				i++;
			} else {
				clearInterval(typewriterInterval);
				if (onComplete) onComplete();
			}
		}, 60);
	}

	function handleNext() {
		gsap.to(nextButton, { opacity: 0, y: 20, duration: 0.5, pointerEvents: 'none' });
		currentText = ''; // Clear text immediately

		if (step === 1) {
			step = 2;
			// Transition 1 -> 2 (Fade and zoom)
			gsap.to(bg1, { opacity: 0, scale: 1.1, duration: 2.5, ease: 'power2.inOut' });
			gsap.set(bg2, { scale: 1.05, opacity: 0 });
			gsap.to(bg2, { opacity: 1, scale: 1, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				typeText(sceneConfig.text2, () => {
					gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
				});
			}});
			gsap.to(bg2, { scale: 1.05, duration: 20, ease: 'none', delay: 2.5 });
			
		} else if (step === 2) {
			step = 3;
			// Transition 2 -> 3 (Fade and zoom)
			gsap.to(bg2, { opacity: 0, scale: 1.1, duration: 2.5, ease: 'power2.inOut' });
			gsap.set(bg3, { scale: 1.05, opacity: 0 });
			gsap.to(bg3, { opacity: 1, scale: 1, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				typeText(sceneConfig.text3, () => {
					nextButton.innerHTML = `${sceneConfig.finalButtonText} <span class="text-xl">→</span>`;
					gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
				});
			}});
			gsap.to(bg3, { scale: 1.05, duration: 20, ease: 'none', delay: 2.5 });
			
		} else if (step === 3) {
			// Go to Outro
			gsap.to(container, {
				opacity: 0,
				duration: 2,
				onComplete: () => {
					$currentScene = 'outro';
				}
			});
		}
	}
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
	<img bind:this={bg1} src={sceneConfig.bg1} alt="Reality 1" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	<img bind:this={bg2} src={sceneConfig.bg2} alt="Reality 2" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	<img bind:this={bg3} src={sceneConfig.bg3} alt="Reality 3" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	
	<!-- Final Step Text Block (Center-Bottom) -->
	<div bind:this={textBlock} class="absolute z-30 bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 w-11/12 md:w-3/5 flex-col items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
		<p class="text-xl md:text-3xl italic font-normal tracking-wide leading-relaxed text-white text-center min-h-[5rem] flex items-center justify-center drop-shadow-lg" style="font-family: 'Cormorant Garamond', serif;">
			{currentText}
		</p>
	</div>

	<!-- Global Next Button -->
	<button 
		bind:this={nextButton} 
		onclick={handleNext}
		class="absolute z-40 bottom-12 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white tracking-widest uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
		style="transform: translateY(20px);"
	>
		{sceneConfig.buttonText} <span class="text-xl">→</span>
	</button>
</div>
