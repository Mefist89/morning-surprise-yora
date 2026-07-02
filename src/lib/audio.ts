import { Howl } from 'howler';
import { config } from './config';

export const audioController = {
	mainTheme: null as Howl | null,
	waves: null as Howl | null,

	init() {
		if (typeof window !== 'undefined') {
			this.mainTheme = new Howl({
				src: [config.audio.mainTheme],
				loop: true,
				volume: 0
			});
			this.waves = new Howl({
				src: [config.audio.waves],
				loop: true,
				volume: 0.5
			});
		}
	}
};
