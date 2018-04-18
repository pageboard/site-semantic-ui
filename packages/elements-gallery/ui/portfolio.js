class HTMLElementPortfolio extends HTMLCustomElement {
	init() {
		this._options = {
			masonry: {
				columnWidth: 'element-portfolio-item'
			},
			itemSelector: 'element-portfolio-item',
			percentPosition: true,
			transitionDuration: 0
		};
	}

	_setup() {
		if (this._loading) return;
		var gallery = this.closest('element-gallery');
		if (gallery && gallery.dataset.mode != "portfolio") return;
		if (this._portfolio) {
			this._teardown();
		}
		this._items = this.querySelector('[block-content="items"]');
		var mode = this._items.className;
		if (!mode) mode = this._items.className = 'cells';
		if (mode == "cells") {
			this._loading = true;
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			this._portfolio = new Isotope(this._items, this._options);
			window.scrollTo(scrollX, scrollY);
			var notAllLoaded = Array.from(this.querySelectorAll('img')).some(function(img) {
				return !img.complete || !img.naturalWidth;
			});
			if (!notAllLoaded) this._loading = false;
			this.addEventListener('load', this._loadListener, true);
		}
	}

	_loadListener() {
		delete this._loading;
		var pf = this._portfolio;
		if (pf) {
			if (this._willLayout) {
				clearTimeout(this._willLayout);
			}
			if (this._willLayout === undefined) {
				pf.layout();
			}
			this._willLayout = setTimeout(function() {
				this._willLayout = false;
				pf.layout();
			}.bind(this), 250);
		}
	}

	_teardown() {
		delete this._loading;
		if (this._portfolio) {
			this._portfolio.destroy();
			delete this._portfolio;
			this.removeEventListener('load', this._loadListener, true);
		}
	}

	connectedCallback() {
		this._setup();
	}

	disconnectedCallback() {
		this._teardown();
	}

	update() {
		this._setup();
	}
}

class HTMLElementPortfolioItem extends HTMLCustomElement {
	connectedCallback() {
		this.update();
	}
	disconnectedCallback() {
		this.update();
	}
	update() {
		var pf = this.closest('element-portfolio');
		if (pf) pf.update();
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-portfolio', HTMLElementPortfolio);
	HTMLCustomElement.define('element-portfolio-item', HTMLElementPortfolioItem);
});

