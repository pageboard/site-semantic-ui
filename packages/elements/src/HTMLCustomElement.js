// this works in babel 6, see postinstall-js
class HTMLCustomElement extends HTMLElement {
	constructor(...args) {
		const self = super(...args);
		self.init();
		return self;
	}
	init() {}
	attributeChangedCallback(name, src, dst, ns) {
		if (src !== dst && this.patch) Page.patch(this);
	}
}
HTMLCustomElement.define = function(name, cla, is) {
	if (cla.init) cla.init();
	if (window.customElements.get(name)) return cla;

	HTMLCustomElement.intercept(cla, {
		connectedCallback: function() {
			if (is && !this._initialized) {
				this._initialized = true;
				if (this.init) this.init();
			}
			Page.connect(this);
		},
		disconnectedCallback: function() {
			Page.disconnect(this);
		}
	});


	window.customElements.define(name, cla, is ? {extends: is} : undefined);
	return cla;
};

function intercept(proto, meth, cb) {
	proto[meth] = (function(fn) {
		return function(...args) {
			var ret = cb.apply(this, args);
			if (fn) ret = fn.apply(this, args);
			return ret;
		};
	})(proto[meth]);
}

HTMLCustomElement.intercept = function(cla, obj) {
	Object.keys(obj).forEach(function(name) {
		intercept(cla.prototype, name, obj[name]);
	});
};

module.exports = HTMLCustomElement;

