class HTMLElementTemplate extends HTMLCustomElement {
	static get defaults() {
		return {
			remote: false
		};
	}
	patch(state) {
		if (this._refreshing || this.closest('[block-content="template"]')) return;
		// first find out if state.query has a key in this.keys
		// what do we do if state.query has keys that are used by a form in this query template ?
		var expr = this.getAttribute('block-expr');
		var vars = {};
		var opts = this.options;
		var scope = state.scope;
		if (expr) {
			try {
				expr = JSON.parse(expr);
			} catch(ex) {
				console.warn("block-expr attribute should contain JSON");
				expr = {};
			}
			var missing = 0;
			var filters = scope.$filters;
			scope.$filters = Object.assign({}, filters, {
				'|': function(val, what) {
					var path = what.scope.path.slice();
					if (path[0] == "$query") {
						var name = path.slice(1).join('.');
						if (name.length && state.query[name] !== undefined) {
							val = state.query[name];
						}
					}
					return val;
				},
				'||': function(val, what) {
					var path = what.scope.path.slice();
					if (path[0] == "$query") {
						var name = path.slice(1).join('.');
						if (name.length) {
							if (val !== undefined) {
								if (val != null) vars[name] = val;
							} else {
								missing++;
							}
						}
					}
				}
			});
			Pageboard.merge(expr, function(val) {
				if (typeof val == "string") try {
					return val.fuse({$query: state.query}, scope);
				} catch(ex) {
					return val;
				}
			});
			scope.$filters = filters;
			Object.keys(vars).forEach(function(key) {
				state.vars[key] = true;
			});
			if (missing) return;
		} else if (!opts.remote) {
			// non-remotes cannot know if they will need $query
		}
		var loader;
		if (opts.remote) {
			var queryStr = Page.format({pathname: "", query: vars});
			if (queryStr == this.dataset.query) return;
			this.dataset.query = queryStr;
			loader = Pageboard.fetch('get', `/.api/query/${this.id}`, vars);
		} else {
			loader = Promise.resolve();
		}
		this._refreshing = true;
		this.classList.remove('error', 'warning', 'success');
		if (opts.remote) this.classList.add('loading');

		return Pageboard.bundle(loader, state).then((res) => {
			this.render(res, state);
		}).catch(function(err) {
			state.scope.$status = -1;
			console.error("Error building", err);
		}).then(() => {
			var name = '[$status|statusClass]'.fuse(state.scope);
			if (name) this.classList.add(name);
			this.classList.remove('loading');
			this._refreshing = false;
		});
	}
	render(data, state) {
		if (this.closest('[contenteditable]')) return;
		if (this.children.length != 2) return;
		var view = this.lastElementChild;
		var template = this.firstElementChild;
		if (!("content" in template) && template.matches('script[type="text/html"]')) {
			var helper =  this.ownerDocument.createElement('div');
			helper.innerHTML = template.textContent;
			template.content = this.ownerDocument.createDocumentFragment();
			template.content.appendChild(template.dom(helper.textContent));
			template.textContent = helper.textContent = '';
		}
		if (template.content) {
			template = template.content;
		}
		if (template.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
			var offView = this.ownerDocument.createElement(view.nodeName);
			offView.appendChild(template.cloneNode(true));
			template = offView;
		}
		// remove all block-id from template - might be done in pagecut eventually
		var rnode;
		while ((rnode = template.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		// pagecut merges block-expr into block-data - contrast with above patch() method
		while ((rnode = template.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		var scope = Object.assign({}, state.scope);
		var usesQuery = false;

		scope.$element = {
			name: `template_element_${this.id}`,
			dom: template,
			filters: {
				'||': function(val, what) {
					var path = what.scope.path;
					if (path[0] != "$query") return;
					usesQuery = true;
					var key;
					if (path.length > 1) {
						// (b)magnet sets val to null so optional values are not undefined
						key = path.slice(1).join('.');
						var undef = val === undefined;
						if (!state.vars[key]) {
							if (undef) console.info("$query." + key, "is undefined");
							state.vars[key] = !undef;
						}
					} else {
						for (key in state.query) state.vars[key] = true;
					}
				}
			},
			contents: Array.from(template.querySelectorAll('[block-content]')).map((node) => {
				return {
					id: node.getAttribute('block-content'),
					nodes: 'block+'
				};
			})
		};
		Object.keys(state.data).forEach(function(key) {
			if (key.startsWith('$') && scope[key] == null) scope[key] = state.data[key];
		});
		scope.$pathname = state.pathname;
		scope.$query = state.query;
		scope.$referrer = state.referrer.pathname || state.pathname;

		var node = Pageboard.render(data, scope);

		view.textContent = '';
		while (node.firstChild) view.appendChild(node.firstChild);
		if (usesQuery) state.scroll({
			once: true,
			node: this.parentNode,
			behavior: 'smooth'
		});
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});

