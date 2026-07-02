<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { config } from '$lib/config';
	import { gsap } from 'gsap';
	import { audioController } from '$lib/audio';
	import confetti from 'canvas-confetti';

	let container: HTMLElement;
	let bg: HTMLImageElement;
	let messageContainer: HTMLElement;
	let signatureElement: HTMLElement;
	
	let currentText = $state('');
	let typewriterInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		// Initial setup
		gsap.set(container, { opacity: 0 });
		gsap.set(messageContainer, { opacity: 0, scale: 0.95, y: 20 });
		
		// 1. Transition to outro
		gsap.to(container, { opacity: 1, duration: 3 });
		gsap.to(bg, { scale: 1.1, duration: 25, ease: 'none' }); // Slow drift
		
		// 2. Show final message container and start typing
		gsap.to(messageContainer, { 
			opacity: 1, 
			scale: 1, 
			y: 0, 
			duration: 2, 
			delay: 2, 
			ease: 'power2.out',
			onComplete: () => {
				typeText(config.scenes.outro.message);
			}
		});

		// 3. Cinematic audio fade out (15 seconds for a very slow fade)
		if (audioController.mainTheme) {
			audioController.mainTheme.fade(audioController.mainTheme.volume(), 0, 15000);
		}
		if (audioController.waves) {
			audioController.waves.fade(audioController.waves.volume(), 0, 15000);
		}
	});

	function typeText(text: string) {
		currentText = '';
		let i = 0;
		if (typewriterInterval) clearInterval(typewriterInterval);
		
		typewriterInterval = setInterval(() => {
			if (i < text.length) {
				currentText += text.charAt(i);
				i++;
			} else {
				clearInterval(typewriterInterval);
				// Fade in signature
				if (signatureElement) {
					gsap.to(signatureElement, { opacity: 1, y: 0, duration: 2, ease: 'power2.out', onComplete: () => {
						triggerConfetti();
					}});
				}
			}
		}, 80); // Slower typing for the dramatic finale
	}

	function triggerConfetti() {
		const duration = 5 * 1000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#ff0000', '#ffc0cb', '#ffffff', '#ff69b4'] };

		function randomInRange(min: number, max: number) {
			return Math.random() * (max - min) + min;
		}

		const interval = setInterval(function() {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 30 * (timeLeft / duration);
			
			// Fire from left and right sides
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
		}, 250);
	}

	onDestroy(() => {
		if (typewriterInterval) clearInterval(typewriterInterval);
	});
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
	<img bind:this={bg} src={config.scenes.outro.background} alt="Infinity" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	
	<div bind:this={messageContainer} class="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-12 w-full max-w-5xl gap-8 md:gap-12">
		<h1 class="text-2xl md:text-4xl lg:text-5xl italic font-normal tracking-wide text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] leading-relaxed whitespace-pre-wrap" style="font-family: 'Cormorant Garamond', serif;">
			{currentText}
		</h1>
		<p bind:this={signatureElement} class="text-2xl md:text-4xl italic font-light tracking-widest text-white/70 opacity-0 transform translate-y-4" style="font-family: 'Cormorant Garamond', serif;">
			{config.scenes.outro.signature}
		</p>
	</div>
</div>
