<script lang="ts">
	import { onMount } from 'svelte';
	import { currentScene } from '$lib/store';
	import { config } from '$lib/config';
	import { gsap } from 'gsap';
	import { fade } from 'svelte/transition';

	let container: HTMLElement;
	let bg1: HTMLImageElement;
	let bg2: HTMLImageElement;
	
	let photoElements: HTMLImageElement[] = [];
	let photoElements2: HTMLElement[] = [];
	let flipContainers: HTMLElement[] = [];
	let textContainer: HTMLElement;
	let nextButton: HTMLButtonElement;
	let step1TextBlock: HTMLElement;
	let step2TextBlock: HTMLElement;
	
	let step = 1;
	let currentIndex = 0;
	let currentText = $state(''); // For photos
	let currentText3 = $state(''); // For final step 1 text
	let currentText2 = $state(''); // For step 2 text
	let zoomedPhoto = $state<string | null>(null); // For fullscreen lightbox
	let typewriterInterval: ReturnType<typeof setInterval>;
	
	const memories = config.scenes.cabin.memories;
	const photos2 = config.scenes.cabin.photos2;

	onMount(() => {
		// Initial setup
		gsap.set(container, { opacity: 0 });
		gsap.set(bg2, { opacity: 0 });
		gsap.set(textContainer, { opacity: 0 });
		gsap.set(step1TextBlock, { opacity: 0, scale: 0.95, display: 'none' });
		gsap.set(step2TextBlock, { opacity: 0, scale: 0.95, display: 'none' });
		
		// Setup photos (hidden, centered)
		photoElements.forEach((el) => {
			if(el) gsap.set(el, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50 });
		});
		
		// 1. Fade in scene
		gsap.to(container, { opacity: 1, duration: 2, onComplete: () => {
			// Start sequence after a 1 second delay
			setTimeout(nextMemory, 1000);
		}});
		gsap.to(bg1, { scale: 1.05, duration: 25, ease: 'none' });
	});

	function nextMemory() {
		if (currentIndex >= memories.length) {
			// Sequence finished, wait 1 second then show central text block
			setTimeout(() => {
				gsap.to(step1TextBlock, { display: 'flex', opacity: 1, scale: 1, duration: 1, ease: 'power2.out', onComplete: () => {
					typeText(config.scenes.cabin.text1, 3, () => {
						gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
					});
				}});
			}, 1000);
			return;
		}

		const photo = photoElements[currentIndex];
		
		// 1. Fade in photo in center
		gsap.set(photo, { opacity: 0, scale: 0.8, xPercent: -50, yPercent: -50, rotation: 0, left: '50%', top: '50%' });
		gsap.to(photo, { 
			opacity: 1, 
			scale: 1, 
			duration: 1, 
			ease: 'back.out(1.5)', 
			onComplete: () => {
				// 2. Fade in text container and start typing
				gsap.to(textContainer, { opacity: 1, duration: 0.5 });
				typeText(memories[currentIndex].text, 1, () => {
					
					// 3. Wait for user to read
					setTimeout(() => {
						// Fade out text
						gsap.to(textContainer, { opacity: 0, duration: 0.5 });
						
						// 4. Move photo to structured background columns (3 left, 3 right)
						const isLeft = currentIndex < 3;
						const colPosition = currentIndex % 3; // 0 = top, 1 = center, 2 = bottom
						
						// Move left/right by ~35vw
						const targetX = (isLeft ? -1 : 1) * (window.innerWidth * 0.35);
						
						// Y position: top (-28vh), middle (0), bottom (+28vh)
						const targetY = (colPosition - 1) * (window.innerHeight * 0.28);
						
						// Slight rotation for natural polaroid look
						const targetRotation = (Math.random() - 0.5) * 15 + (isLeft ? -10 : 10);
						
						gsap.to(photo, {
							x: targetX,
							y: targetY,
							scale: 0.6, // shrink by 40% (scale down to 60%)
							rotation: targetRotation,
							duration: 6,
							ease: 'power3.inOut',
							onComplete: () => {
								// 5. Wait 1 second before showing next memory
								setTimeout(() => {
									currentIndex++;
									nextMemory();
								}, 1000);
							}
						});
					}, 1500); // 1.5s delay to read
					
				});
			}
		});
	}

	function typeText(text: string, target: 1 | 2 | 3 = 1, onComplete?: () => void) {
		if (target === 1) currentText = '';
		else if (target === 2) currentText2 = '';
		else currentText3 = '';
		
		let i = 0;
		if (typewriterInterval) clearInterval(typewriterInterval);
		
		typewriterInterval = setInterval(() => {
			if (i < text.length) {
				if (target === 1) currentText += text.charAt(i);
				else if (target === 2) currentText2 += text.charAt(i);
				else currentText3 += text.charAt(i);
				i++;
			} else {
				clearInterval(typewriterInterval);
				if (onComplete) onComplete();
			}
		}, 60);
	}

	function handleNext() {
		if (step === 1) {
			step = 2;
			currentText = ''; // Clear text immediately
			
			// Fade out all photos smoothly
			photoElements.forEach((el) => {
				if(el) gsap.to(el, { opacity: 0, scale: 0.5, y: '-=50', duration: 1, ease: 'power2.in' });
			});
			// Fade out the step 1 text block
			gsap.to(step1TextBlock, { opacity: 0, scale: 0.9, duration: 1, onComplete: () => {
				gsap.set(step1TextBlock, { display: 'none' });
			}});
			
			gsap.to(nextButton, { opacity: 0, y: -10, duration: 0.5, pointerEvents: 'none' });
			
			// Camera turning right transition
			gsap.to(bg1, { opacity: 0, xPercent: -30, duration: 2.5, ease: 'power2.inOut' });
			
			gsap.set(bg2, { xPercent: 30, opacity: 0 });
			gsap.to(bg2, { opacity: 1, xPercent: 0, duration: 2.5, ease: 'power2.inOut', onComplete: () => {
				
				// 1. Animate Step 2 photos falling in from top
				gsap.fromTo(photoElements2, 
					{ opacity: 0, y: -50 }, 
					{ opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: 'back.out(1.2)', onComplete: () => {
						
						// 2. Flip them one by one, every 1 second
						flipContainers.forEach((container, i) => {
							gsap.to(container, {
								rotateY: 180,
								duration: 1.5,
								ease: 'power2.inOut',
								delay: (i + 1) * 1 // Delays: 1s, 2s, 3s
							});
						});
						
						// 3. Show bottom text block and type (start appearing as last card flips)
						setTimeout(() => {
							gsap.to(step2TextBlock, { display: 'flex', opacity: 1, scale: 1, duration: 1, ease: 'power2.out', onComplete: () => {
								typeText(config.scenes.cabin.text2, 2, () => {
									gsap.to(nextButton, { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });
								});
							}});
						}, 4000);
					}}
				);
				
			}});
			gsap.to(bg2, { scale: 1.05, duration: 15, ease: 'none' }); 
			
		} else if (step === 2) {
			gsap.to(container, {
				opacity: 0,
				duration: 1.5,
				onComplete: () => {
					$currentScene = 2;
				}
			});
		}
	}
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full bg-black overflow-hidden flex items-center justify-center">
	<img bind:this={bg1} src={config.scenes.cabin.background1} alt="Cabin 1" class="absolute inset-0 w-full h-full object-cover origin-center opacity-50" />
	<img bind:this={bg2} src={config.scenes.cabin.background2} alt="Cabin 2" class="absolute inset-0 w-full h-full object-cover origin-center opacity-50" />
	
	<!-- Photos Overlay Layer -->
	<div class="absolute inset-0 z-10 pointer-events-none {step === 2 ? 'hidden' : ''}">
		{#each memories as memory, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img 
				bind:this={photoElements[i]}
				src={memory.photo} 
				onclick={() => zoomedPhoto = memory.photo}
				class="absolute opacity-0 shadow-[0_15px_30px_rgba(0,0,0,0.8)] border-[6px] md:border-8 border-white/95 rounded-sm object-cover max-w-[200px] md:max-w-[300px] aspect-[4/5] origin-center pointer-events-auto transition-all hover:scale-110 hover:z-50 cursor-pointer" 
			/>
		{/each}
	</div>

	<!-- Text Container (Below the central photo) -->
	<div bind:this={textContainer} class="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 translate-y-[130px] md:translate-y-[200px] w-full max-w-xl px-4 pointer-events-none {step === 2 ? 'hidden' : ''}">
		<p class="text-xl md:text-3xl italic font-normal text-white text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-relaxed bg-black/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10" style="font-family: 'Cormorant Garamond', serif;">
			{currentText}
		</p>
	</div>
	
	<!-- Photos for Step 2 -->
	<div class="absolute inset-x-0 top-8 md:top-16 z-20 flex justify-center items-start gap-4 md:gap-12 pointer-events-none {step === 1 ? 'hidden' : ''}">
		{#each photos2 as photo, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div 
				bind:this={photoElements2[i]}
				class="w-[30%] md:w-[280px] opacity-0 aspect-[4/5] origin-center pointer-events-auto cursor-pointer" 
				style="transform: rotate({i === 1 ? 0 : (i === 0 ? -4 : 4)}deg); perspective: 1000px;"
				onclick={() => {
					// Only allow zoom if it has finished flipping (180deg)
					// A simple way is to check opacity or just allow it always since it's the real photo side
					zoomedPhoto = photo;
				}}
			>
				<div class="w-full h-full transition-transform hover:scale-105 hover:z-50" style="transform-style: preserve-3d;">
					<div 
						bind:this={flipContainers[i]} 
						class="relative w-full h-full shadow-[0_15px_30px_rgba(0,0,0,0.8)] border-[4px] md:border-8 border-white/95 rounded-sm"
						style="transform-style: preserve-3d; transform: rotateY(0deg);"
					>
						<!-- Front (r.png - back of photo) -->
						<!-- svelte-ignore a11y_missing_attribute -->
						<img src="/assets/scena1/r.png" class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden;" />
						
						<!-- Back (Actual photo) -->
						<!-- svelte-ignore a11y_missing_attribute -->
						<img src={photo} class="absolute inset-0 w-full h-full object-cover" style="backface-visibility: hidden; transform: rotateY(180deg);" />
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Final Step 1 Text Block (Center) -->
	<div bind:this={step1TextBlock} class="relative z-30 w-full md:w-2/4 flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
		<p class="text-3xl md:text-5xl italic font-normal tracking-wide leading-relaxed text-white text-center min-h-[6rem] md:min-h-[10rem] flex items-center justify-center drop-shadow-md" style="font-family: 'Cormorant Garamond', serif;">
			{currentText3}
		</p>
	</div>
	
	<!-- Final Step 2 Text Block (Bottom) -->
	<div bind:this={step2TextBlock} class="absolute z-30 bottom-32 left-1/2 -translate-x-1/2 w-11/12 md:w-2/4 flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] {step === 1 ? 'hidden' : 'flex'}">
		<p class="text-3xl md:text-5xl italic font-normal tracking-wide leading-relaxed text-white text-center min-h-[4rem] flex items-center justify-center drop-shadow-md" style="font-family: 'Cormorant Garamond', serif;">
			{currentText2}
		</p>
	</div>

	<!-- Global Next Button -->
	<button 
		bind:this={nextButton} 
		onclick={handleNext}
		class="absolute z-40 bottom-10 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white tracking-widest uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
		style="transform: translateY(20px);"
	>
		{#if step === 1}
			{config.scenes.cabin.buttonText1}
		{:else}
			{config.scenes.cabin.buttonText2}
		{/if}
		<span class="text-xl">→</span>
	</button>
	
	<!-- Fullscreen Photo Zoom Overlay -->
	{#if zoomedPhoto}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="absolute inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-12 cursor-pointer"
			onclick={() => zoomedPhoto = null}
			transition:fade={{duration: 300}}
		>
			<img 
				src={zoomedPhoto} 
				alt="Zoomed Memory" 
				class="max-w-full max-h-full object-contain rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-4 md:border-8 border-white/90"
			/>
		</div>
	{/if}
</div>
