class HTMLElementTemplate extends HTMLCustomElement {
	static get defaults() {
		return {
			remote: false
		};
	}
	patch(state) {
		var me = this;
		if (me._refreshing || me.closest('[block-content="template"]')) return;
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
			scope.$filters['||'] = function(val, what) {
				var path = what.scope.path.slice();
				if (path[0] == "$query") {
					path = path.slice(1).join('.');
					if (path.length) {
						if (val !== undefined) vars[path] = val;
						else missing++;
					}
				}
			};
			Pageboard.merge(expr, function(val) {
				if (typeof val == "string") try {
					return val.fuse({$query: state.query}, scope);
				} catch(ex) {
					return val;
				}
			});
			delete scope.$filters['||'];
			Object.keys(vars).forEach(function(key) {
				state.vars[key] = true;
			});
			if (missing) return;
		} else if (!opts.remote) {
			// non-remotes cannot know if they will need $query
		}
		var queryId = me.getAttribute('block-id');
		var loader;
		if (opts.remote) {
			var queryStr = Page.format({pathname: "", query: vars});
			if (queryStr == me.dataset.query) return;
			me.dataset.query = queryStr;
			loader = Pageboard.fetch('get', `/.api/query/${queryId}`, vars);
		} else {
			loader = Promise.resolve();
		}
		me._refreshing = true;
		me.classList.remove('error', 'warning', 'success');
		if (opts.remote) me.classList.add('loading');

		return Pageboard.bundle(loader, state).then(function(res) {
			me.render(res, state);
		}).catch(function(err) {
			state.scope.$status = -1;
			console.error("Error building", err);
		}).then(function() {
			var name = '[$status|statusClass]'.fuse(state.scope);
			if (name) me.classList.add(name);
			me.classList.remove('loading');
			me._refreshing = false;
		});
	}
	render(data, state) {
		if (this.closest('[contenteditable]')) return;
		if (this.children.length != 2) return;
		var view = this.lastElementChild;
		var template = this.firstElementChild;
		// minimal template polyfill, works only for rendering
		if (template.nodeName == "TEMPLATE" && !("content" in template)) {
			template.content = template.ownerDocument.createDocumentFragment();
			for (var i=0; i < template.childNodes.length; i++) {
				template.content.appendChild(template.childNodes[i].cloneNode(true));
			}
		}
		if (template.content) template = template.content;
		// remove all block-id from template
		var rnode;
		while ((rnode = template.querySelector('[block-id]'))) rnode.removeAttribute('block-id');
		while ((rnode = template.querySelector('[block-expr]'))) rnode.removeAttribute('block-expr');

		var scope = Object.assign({}, state.scope);

		scope.$element = {
			name: 'template_element_' + this.getAttribute('block-id'),
			dom: template,
			filters: {
				'||': function(val, what) {
					var path = what.scope.path;
					if (path[0] != "$query") return;
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
			}
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
		if (!state.scrollIntoView && view.scrollIntoView) {
			state.scrollIntoView = true;
			view.scrollIntoView({
				block: "nearest"
			});
		}
	}
}
Page.ready(function() {
	HTMLCustomElement.define('element-template', HTMLElementTemplate);
});
