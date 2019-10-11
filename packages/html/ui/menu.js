Page.patch(function(state) {
	state.finish(function() {
		Array.prototype.forEach.call(
			document.querySelectorAll('.ui.menu [href]'),
			function(item) {
				var loc = item.getAttribute('href');
				if (loc) {
					loc = Page.parse(loc);
					loc.query.develop = state.query.develop;
					if (Page.samePath(loc, state)) {
						item.classList.add('active');
					}
				}
			}
		);
	});
});

class HTMLElementMenu extends HTMLCustomElement {
	static get defaults() {
		return {
			all: true
		}
	}
	setup(state) {
		if (this.isContentEditable || this.matches('.vertical')) return;
		const menu = this.firstElementChild;
		const helper =  this.lastElementChild;
		const helperMenu = helper.lastElementChild;
		helperMenu.appendChild(this.toHelper(menu));
		document.body.addEventListener('click', (e) => {
			this.bodyClick(e, state);
		});
		this.observer = new ResizeObserver((entries, observer) => {
			var prev = this.previousElementSibling;
			var availWidth = this.offsetLeft + this.offsetWidth - (prev ? prev.offsetLeft + prev.offsetWidth : 0);
			entries.forEach((entry) => {
				let child, tossed;
				let enabled = false;
				const len = menu.children.length - 1;
				for (let i = len; i >= 0; i--) {
					child = menu.children[i];
					tossed = (this.options.all && tossed) || child.offsetLeft + child.offsetWidth > availWidth;
					child.classList.toggle('tossed', tossed);
					helperMenu.children[i].hidden = !tossed;
					if (tossed) enabled = true;
				}
				this.classList.toggle('responsive', enabled);
			});
		});
		this.observer.observe(this.parentNode);
	}
	close(state) {
		if (this.observer) this.observer.disconnect();
	}
	bodyClick(e, state) {
		if (this.active) {
			this.active.classList.toggle('active', false);
		}
		let item = this.lastElementChild.contains(e.target) && !e.target.closest('a') && e.target.closest('.item:not(.tosser)');
		if (item) {
			item.classList.toggle('active', true);
			this.active = item;
		}
		this.lastElementChild.classList.toggle('active', !!item);
	}
	toHelper(root) {
		var frag = root.ownerDocument.createDocumentFragment();
		Array.from(root.children).forEach((item) => {
			frag.append(item.cloneNode(true));
		});
		return frag;
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-menu', HTMLElementMenu);
});
