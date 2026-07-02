<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentScene } from '$lib/store';
	import { config } from '$lib/config';
	import { gsap } from 'gsap';

	let container: HTMLElement;
	let bg1: HTMLImageElement;
	let bg2: HTMLImageElement;
	let bg3: HTMLImageElement;
	let bg4: HTMLImageElement;
	let textBlock: HTMLElement;
	let nextButton: HTMLButtonElement;
	let bearImage: HTMLImageElement;
	let songbirdImage: HTMLImageElement;
	let flipWrapper: HTMLElement;
	let flipContainer: HTMLElement;
	let flipWrapper2: HTMLElement;
	let flipContainer2: HTMLElement;
	
	let step = 1;
	let currentText = $state('');
	let typewriterInterval: ReturnType<typeof setInterval>;

	const sceneConfig = config.scenes.cinema;

	onMount(() => {
		// Initial setup
		gsap.set(container, { opacity: 0 });
		gsap.set([bg2, bg3, bg4], { opacity: 0 });
		gsap.set(textBlock, { opacity: 0, scale: 0.95, display: 'none' });
		gsap.set(bearImage, { opacity: 0, y: -20, scale: 0.9 });
		gsap.set(songbirdImage, { opacity: 0, y: -20, scale: 0.9, display: 'none' });
		gsap.set(flipWrapper, { opacity: 0, y: -200, display: 'none' });
		gsap.set(flipWrapper2, { opacity: 0, y: 200, display: 'none' });
		
		// 1. Fade in scene
		gsap.to(container, { opacity: 1, duration: 2, onComplete: () => {
			
			// Show Bear image
			gsap.to(bearImage, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'power3.out' });
			
			// Show first text block
			gsap.to(textBlock, { display: 'flex', opacity: 1, scale: 1, duration: 1, delay: 1, ease: 'power2.out', onComplete: () => {
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
			// Fade out bear
			gsap.to(bearImage, { opacity: 0, y: -50, scale: 0.9, duration: 1.5, ease: 'power2.inOut', onComplete: () => {
				gsap.set(bearImage, { display: 'none' });
			}});
			
			// Transition 1 -> 2 (Pan Right)
			gsap.to(bg1, { opacity: 0, xPercent: -20, duration: 2.5, ease: 'power2.inOut' });
			gsap.set(bg2, { xPercent: 20, opacity: 0 });
			gsap.to(bg2, { opacity: 1, xPercent: 0, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				
				// Show SongBird image
				gsap.set(songbirdImage, { display: 'block' });
				gsap.to(songbirdImage, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'power3.out' });
				
				typeText(sceneConfig.text2, () => {
					gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
				});
			}});
			gsap.to(bg2, { scale: 1.05, duration: 20, ease: 'none' });
			
		} else if (step === 2) {
			step = 3;
			// Fade out SongBird
			gsap.to(songbirdImage, { opacity: 0, y: -50, scale: 0.9, duration: 1.5, ease: 'power2.inOut', onComplete: () => {
				gsap.set(songbirdImage, { display: 'none' });
			}});
			
			// Transition 2 -> 3 (Pan Left)
			gsap.to(bg2, { opacity: 0, xPercent: 20, duration: 2.5, ease: 'power2.inOut' });
			gsap.set(bg3, { xPercent: -20, opacity: 0 });
			gsap.to(bg3, { opacity: 1, xPercent: 0, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				
				// 1. Photo falls from top
				gsap.set(flipWrapper, { display: 'block' });
				gsap.to(flipWrapper, { opacity: 1, y: 0, duration: 1.5, ease: 'back.out(1.2)', onComplete: () => {
					
					// 2. Photo flips over
					gsap.to(flipContainer, {
						rotateY: 180,
						duration: 1.5,
						ease: 'power3.inOut',
						delay: 0.5,
						onComplete: () => {
							// 3. Text types out
							typeText(sceneConfig.text3, () => {
								gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
							});
						}
					});
				}});
			}});
			gsap.to(bg3, { scale: 1.05, duration: 20, ease: 'none' });
			
		} else if (step === 3) {
			step = 4;
			
			// Fade out Flip Photo
			gsap.to(flipWrapper, { opacity: 0, y: -50, scale: 0.9, duration: 1.5, ease: 'power2.inOut', onComplete: () => {
				gsap.set(flipWrapper, { display: 'none' });
			}});

			// Transition 3 -> 4 (Pan Up)
			gsap.to(bg3, { opacity: 0, yPercent: -20, duration: 2.5, ease: 'power2.inOut' });
			gsap.set(bg4, { yPercent: 20, opacity: 0 });
			gsap.to(bg4, { opacity: 1, yPercent: 0, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				
				// 1. Photo 2 springs up from bottom
				gsap.set(flipWrapper2, { display: 'block' });
				gsap.to(flipWrapper2, { opacity: 1, y: 0, duration: 1.5, ease: 'back.out(1.2)', onComplete: () => {
					
					// 2. Photo flips over
					gsap.to(flipContainer2, {
						rotateY: 180,
						duration: 1.5,
						ease: 'power3.inOut',
						delay: 0.5,
						onComplete: () => {
							// 3. Text types out
							typeText(sceneConfig.text4, () => {
								gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
							});
						}
					});
				}});
			}});
			gsap.to(bg4, { scale: 1.05, duration: 20, ease: 'none' });
			
		} else if (step === 4) {
			
			// Fade out Flip Photo 2
			gsap.to(flipWrapper2, { opacity: 0, y: -50, scale: 0.9, duration: 1.5, ease: 'power2.inOut' });

			// Go to Scene 3
			gsap.to(container, {
				opacity: 0,
				duration: 1.5,
				onComplete: () => {
					$currentScene = 3;
				}
			});
		}
	}
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
	<img bind:this={bg1} src={sceneConfig.bg1} alt="Cinema 1" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	<img bind:this={bg2} src={sceneConfig.bg2} alt="Cinema 2" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	<img bind:this={bg3} src={sceneConfig.bg3} alt="Cinema 3" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	<img bind:this={bg4} src={sceneConfig.bg4} alt="Cinema 4" class="absolute inset-0 w-full h-full object-cover origin-center opacity-70" />
	
	<!-- Bear Image (Step 1) -->
	<img bind:this={bearImage} src={sceneConfig.m1} alt="Bear" class="absolute z-20 top-4 md:top-12 left-1/2 -translate-x-1/2 w-[50%] md:w-[280px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

	<!-- SongBird Image (Step 2) -->
	<img bind:this={songbirdImage} src={sceneConfig.f2} alt="SongBird" class="absolute z-20 top-4 md:top-12 left-1/2 -translate-x-1/2 w-[50%] md:w-[280px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

	<!-- Flip Photo 1 (Step 3) -->
	<div 
		bind:this={flipWrapper}
		class="absolute z-20 top-4 md:top-12 left-1/2 -translate-x-1/2 w-[50%] md:w-[250px] aspect-[4/5] origin-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer" 
		style="perspective: 1000px;"
	>
		<div class="w-full h-full transition-transform hover:scale-105 hover:z-50" style="transform-style: preserve-3d;">
			<div 
				bind:this={flipContainer} 
				class="relative w-full h-full shadow-[0_15px_30px_rgba(0,0,0,0.8)] border-[4px] md:border-8 border-white/95 rounded-sm"
				style="transform-style: preserve-3d; transform: rotateY(0deg);"
			>
				<!-- Front (r.png) -->
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src="/assets/scena1/r.png" class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden;" />
				
				<!-- Back (t1.jpg) -->
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src={sceneConfig.t1} class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden; transform: rotateY(180deg);" />
			</div>
		</div>
	</div>

	<!-- Flip Photo 2 (Step 4) -->
	<div 
		bind:this={flipWrapper2}
		class="absolute z-20 top-4 md:top-12 left-1/2 -translate-x-1/2 w-[50%] md:w-[250px] aspect-[4/5] origin-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer" 
		style="perspective: 1000px;"
	>
		<div class="w-full h-full transition-transform hover:scale-105 hover:z-50" style="transform-style: preserve-3d;">
			<div 
				bind:this={flipContainer2} 
				class="relative w-full h-full shadow-[0_15px_30px_rgba(0,0,0,0.8)] border-[4px] md:border-8 border-white/95 rounded-sm"
				style="transform-style: preserve-3d; transform: rotateY(0deg);"
			>
				<!-- Front (r.png) -->
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src="/assets/scena1/r.png" class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden;" />
				
				<!-- Back (t2.jpg) -->
				<!-- svelte-ignore a11y_missing_attribute -->
				<img src={sceneConfig.t2} class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden; transform: rotateY(180deg);" />
			</div>
		</div>
	</div>

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
