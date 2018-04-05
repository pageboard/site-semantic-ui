class HTMLElementImage extends HTMLCustomElement {
	init() {
		this.load = this.load.bind(this);
	}
	connectedCallback() {
		if ("IntersectionObserver" in window) {
			this._observer = new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting || entry.intersectionRatio > 0) {
						entry.target.reveal();
					}
				});
			}, {
				threshold: 0
			});
			this._observer.observe(this);
		} else {
			this.reveal();
		}
	}
	fix(img) {
		if (!objectFitImages.supportsObjectFit) {
			var style = "";
			if (this.dataset.fit) {
				style += `object-fit: ${this.dataset.fit};`;
			}
			if (this.dataset.position) {
				style += `object-position: ${this.dataset.position};`;
			}
			if (style.length) {
				img.style.fontFamily = `'${style}'`;
				objectFitImages(img);
			}
		}
	}
	reveal(force) {
		var img = this.querySelector('img');
		if (!img) return;
		this.disconnectedCallback();
		var src = img.getAttribute('src');
		if (!src) src = this.dataset.url;
		img.addEventListener('load', this.load, false);
		img.addEventListener('error', this.load, false);
		if (!src || !img.classList.contains('lqip')) return;
		if (!force && this._revealAt) return;
		this._revealAt = Date.now();
		if (this.dataset.url) this._revealAt = true;
		var z = parseFloat(img.dataset.zoom);
		if (isNaN(z)) z = 100;
		var w = parseInt(img.dataset.width);
		var h = parseInt(img.dataset.height);
		var zoom;
		if (!isNaN(w) && !isNaN(h)) {
			var rect = this.parentNode.getBoundingClientRect();
			var rw = rect.width;
			var rh = rect.height;
			if (rw || rh) {
				if (!rw) rw = rh * w / h;
				if (!rh) rh = rw * h / w;
				zoom = Math.round(Math.max(rw / w, rh / h) * 100);
				// what's the point
				if (Math.abs(zoom - z) < 20 || zoom > 100) zoom = null;
			}
		}

		var loc = Page.parse(src);
		delete loc.query.q;
		if (!zoom) delete loc.query.rs;
		else loc.query.rs = "z-" + zoom;
		src = Page.format(loc);
		img.setAttribute('src', src);
	}
	update() {
		this.reveal(true);
	}
	load(e) {
		var img = e.target;
		img.removeEventListener('load', this.load, false);
		img.removeEventListener('error', this.load, false);
		var rev = this._revealAt;
		if (rev && rev !== true && Date.now() - rev > 1000) {
			img.classList.add('lqip-reveal');
		}
		img.classList.remove('lqip');
		this.fix(img);
	}
	disconnectedCallback() {
		if (this._observer) {
			this._observer.unobserve(this);
			delete this._observer;
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-image', HTMLElementImage);
});
