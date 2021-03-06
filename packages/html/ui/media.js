const MixinMedia = {
	init() {
		this.promise = Promise.resolve();
		this.promise.done = function() {};
	},
	patch(state) {
		this.classList.remove('error', 'loading');
		var loc = Page.parse(this.options.src);
		var meta = state.scope.$hrefs && state.scope.$hrefs[loc.pathname] || {};
		if (!meta || !meta.width || !meta.height) return;
		this.width = meta.width;
		this.height = meta.height;
	},
	reveal(state) {
		var curSrc = this.options.src;
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch(e) {
				// pass
			}
			this.setAttribute('src', curSrc);
		}
		if (this.isContentEditable) this.pause();
		return this.promise;
	},
	handleClick(e) {
		if (this.isContentEditable) e.preventDefault();
	},
	captureLoad() {
		this.promise.done();
		this.classList.remove('loading');
	},
	captureError() {
		this.promise.done();
		this.classList.remove('loading');
		this.classList.add('error');
	}
};

class HTMLElementVideo extends HTMLVideoElement {
	static get defaults() {
		return {
			dataSrc: null
		};
	}
}
Object.assign(HTMLElementVideo.prototype, MixinMedia);

class HTMLElementAudio extends HTMLAudioElement {
	static get defaults() {
		return {
			dataSrc: null
		};
	}
}
Object.assign(HTMLElementAudio.prototype, MixinMedia);

HTMLCustomElement.define('element-video', HTMLElementVideo, 'video');
HTMLCustomElement.define('element-audio', HTMLElementAudio, 'audio');
