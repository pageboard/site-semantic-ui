class HTMLCustomFormElement extends HTMLFormElement {
	init() {
		this.getMethodLater = Pageboard.debounce(this.getMethod, 300);
	}
	patch(state) {
		if (state.scope.$write) return;
		if (this.method != "get") return;
		// do not fill form from current state if form does not submit to current pathname
		if (!Page.samePathname(state, this.action)) return;
		this.fill(state.query);
	}
	read() {
		var fd = new FormData(this);
		var query = {};
		fd.forEach(function(val, key) {
			if (val == null || val == "") {
				var cur = this.querySelector(`[name="${key}"]`);
				if (cur.required == false && cur.type != "radio") {
					val = undefined;
				} else {
					val = null;
				}
			}
			var old = query[key];
			if (old !== undefined) {
				if (!Array.isArray(old)) {
					query[key] = [old];
				}
				query[key].push(val);
			} else {
				query[key] = val;
			}
		}, this);
		// checkbox fix
		Array.from(this.elements).forEach(function(node) {
			if (node.type != "checkbox") return;
			if (node.name && node.value == "true" && !query[node.name]) query[node.name] = node.checked;
		});
		var btn = document.activeElement;
		if (btn && btn.type == "submit" && btn.name && query[btn.name] === undefined) {
			query[btn.name] = btn.value;
		}
		return query;
	}
	fill(values) {
		var count = 0;
		var elem = null, name, val;
		for (var i = 0; i < this.elements.length; i++) {
			elem = this.elements[i];
			name = elem.name;
			if (!name) continue;
			count++;
			val = `[${name}|or:]`.fuse(values);
			switch (elem.type) {
			case 'submit':
				break;
			case 'radio':
			case 'checkbox':
				if (!Array.isArray(val)) val = [val];
				elem.checked = val.some(function(str) {
					return str.toString() == elem.value;
				});
				break;
			case 'select-multiple':
				elem.fill(val);
				break;
			case 'textarea':
				elem.innerText = val;
				break;
			case 'hidden':
				break;
			default:
				if (elem.fill) {
					elem.fill(val);
				} else {
					elem.value = val;
				}
				break;
			}
		}
		return count;
	}
	handleSubmit(e, state) {
		if (e.type == "submit") e.preventDefault();
		if (state.scope.$write) return;
		this.classList.remove('error', 'warning', 'success');
		if (this.matches('.loading')) return;
		var fn = this[this.method + 'Method'];
		if (e.type == "input" && (!e.target || !["radio", "checkbox"].includes(e.target.type))) {
			fn = this[this.method + 'MethodLater'] || fn;
		}
		if (fn) fn.call(this, e, state);
		else console.error("Unsupported form method", this.method);
	}
	handleInput(e, state) {
		if (e.type == "input") {
			this.ignoreInputChange = true;
		} else if (e.target && e.target.matches('input') && this.ignoreInputChange) {
			return;
		}
		this.handleSubmit(e, state);
	}
	handleChange(e, state) {
		this.handleInput(e, state);
	}
	getMethod(e, state) {
		this.ignoreInputChange = false;
		var form = this;
		var loc = Page.parse(form.action);
		Object.assign(loc.query, form.read());
		if (Page.samePathname(loc, state)) {
			loc.query = Object.assign({}, state.query, loc.query);
		} else if (e.type != "submit") {
			// do not automatically submit form if form pathname is not same as current pathname
			return;
		}
		var status = 200;
		return state.push(loc).catch(function(err) {
			if (err.status != null) status = err.status;
			else status = 0;
		}).then(function() {
			var statusClass = `[n|statusClass]`.fuse({n: status});
			if (statusClass) form.classList.add(statusClass);
		});
	}
	postMethod(e, state) {
		if (e.type != "submit") return;
		var form = this;
		form.classList.add('loading');
		var data = {
			$query: state.query
		};
		var status = 200;
		return Promise.all(Array.prototype.filter.call(form.elements, function(node) {
			return node.type == "file";
		}).map(function(input) {
			return input.closest('element-input-file').upload();
		})).then(function() {
			data.$query = state.query;
			data.$request = form.read();
			form.disable();
			return Pageboard.fetch(form.method, Page.format({
				pathname: form.action,
				query: data.$query
			}), data.$request);
		}).catch(function(err) {
			if (err.status != null) status = err.status;
			else status = 0;
		}).then(function(res) {
			if (res && res.grants) state.data.$grants = res.grants;
			state.scope.$response = res;
			form.classList.remove('loading');
			var statusClass = `[n|statusClass]`.fuse({n: status});
			if (statusClass) form.classList.add(statusClass);
			form.enable();
			if (status < 200 || status >= 400) return;
			var redirect = form.getAttribute('redirection');
			if (!redirect) return;
			data.$response = res;
			data.$status = status;
			var loc = Page.parse(redirect.fuse(data, state.scope));
			loc.data = state.data;
			var vary = false;
			if (Page.samePathname(loc, state)) {
				if (res.granted) {
					vary = true;
				} else {
					vary = "patch";
					loc.query = Object.assign({}, state.query, loc.query);
				}
				state.data.$vary = vary
			}
			Array.from(document.querySelectorAll('element-template')).forEach(function(node) {
				delete node.dataset.query;
			});
			return state.push(loc, {
				vary: vary
			});
		});
	}
}

/* these methods must be available even on non-upgraded elements */
HTMLFormElement.prototype.enable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = false;
		if (elem.hasAttribute('disabled')) elem.removeAttribute('disabled');
	}
};
HTMLFormElement.prototype.disable = function() {
	var elem = null;
	for (var i = 0; i < this.elements.length; i++) {
		elem = this.elements[i];
		elem.disabled = true;
	}
};

Page.setup(function() {
	HTMLCustomElement.define(`element-form`, HTMLCustomFormElement, 'form');
});


HTMLSelectElement.prototype.fill = function(values) {
	var opt;
	for (var i = 0; i < this.options.length; i++) {
		opt = this.options[i];
		opt.selected = values.indexOf(opt.value) > -1;
	}
};

HTMLInputElement.prototype.fill = function(val) {
	var subFill = this[this.type + 'Fill'];
	if (subFill) return subFill.call(this, val);
	else this.value = val;
};

HTMLInputElement.prototype.reset = function() {
	var subReset = this[this.type + 'Reset'];
	if (subReset) return subReset.call(this);
	else this.value = "";
};

Page.setup(function(state) {
	// https://daverupert.com/2017/11/happier-html5-forms/
	document.body.addEventListener('blur', blurHandler, true);
	document.body.addEventListener('focus', focusHandler, true);
	document.body.addEventListener('invalid', invalidHandler, true);

	function updateClass(field, validity, remove) {
		for (var key in validity) {
			if (key == "valid") continue;
			var has = validity[key];
			field.classList.toggle(key, !remove && has);
		}
		field.classList.toggle('error', !remove && !validity.valid);
	}
	function invalidHandler(e) {
		// e.preventDefault(); // disable when we have proper messages
		blurHandler(e, true);
	}
	function blurHandler(e, checked) {
		var el = e.target;
		if (!e.target.matches('input,textarea,select')) return;
		if (!checked) el.checkValidity();
		updateClass(el.closest('.field') || el, el.validity);
	}
	function focusHandler(e) {
		var el = e.target;
		if (!el.matches('input,textarea,select')) return;
		if (e.relatedTarget && e.relatedTarget.type == "submit") return;
		updateClass(el.closest('.field') || el, el.validity, true);
	}
});

Page.ready(function(state) {
	var filters = state.scope.$filters;
	filters.form = function(val, what, action) {
		var form = what.parent.closest('form');
		if (!form) {
			console.warn("No parent form found");
			return val;
		}
		if (action == "toggle") {
			action = val ? "enable" : "disable";
		}
		if (action == "enable") form.enable();
		else if (action == "disable") form.disable();
		return val;
	};
});