Page.patch(function(state) {
	return Promise.all(Array.from(document.querySelectorAll('element-query')).map(function(node) {
		return node.refresh(state.query);
	}));
});

class HTMLElementQuery extends HTMLCustomElement {
	static find(name, value) {
		// convert query into a query that contains only
		var nodes = document.querySelectorAll(`form [name="${name}"]`);
		return Array.prototype.filter.call(nodes, function(node) {
			if (Array.isArray(value)) {
				if (value.indexOf(node.value) < 0) return;
			} else {
				if (value != node.value) return;
			}
			return true;
		});
	}
	static filterQuery(query) {
		var obj = {};
		for (var name in query) {
			var vals = HTMLElementQuery.find(name, query[name]).map(function(node) {
				return node.value;
			});
			if (vals.length == 1) {
				obj[name] = vals[0];
			} else if (vals.length > 1) {
				obj[name] = vals;
			}
		}
		return obj;
	}
	connectedCallback() {
		this.refresh();
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		if (attributeName.startsWith('data-')) this.refresh();
	}
	update() {
		return this.refresh();
	}
	refresh(query) {
		if (!this.children.length) return;
		if (!query) {
			if (!Page.state) return;
			query = Page.state.query;
		}
		if (this._refreshing) return;

		var results = this.querySelector('.results');

		if (query._id) console.warn("query._id is reserved");
		var vars = {};
		var missing = 0;
		var candidate = 0;
		if (this.dataset.type) {
			var form = document.querySelector(`form[data-type="${this.dataset.type}"]`);
			if (form && form.closest('[block-type="query"],[block-type="mail_query"]') != this) {
				Array.prototype.forEach.call(form.elements, function(node) {
					var key = node.name;
					if (!key) return;
					if (query[key] !== undefined) {
						vars[key] = query[key];
						candidate++;
					} else if (node.required) {
						missing++;
					}
				});
			}
		}
		if (this.dataset.vars) {
			this.dataset.vars.split(',').forEach(function(key) {
				var wasUndefined = false;
				var val = matchdom(`[$query.${key}|isUndefined]`, {$query: query}, Object.assign({
					isUndefined: function(val) {
						if (val === undefined) wasUndefined = true;
					}
				}, HTMLElementQuery.filters));
				var name = key.split('|').shift();
				if (!wasUndefined) {
					candidate++;
					vars[name] = val;
				} else {
					var node = document.querySelector(`form [name="${name}"]`);
					if (node && node.required) missing++;
				}
			});
			if (candidate == 0) return;
		}
		var form = this;
		if (missing > 0) {
			form.classList.add('error');
			return;
		}
		this._refreshing = true;
		vars._id = this.getAttribute('block-id');

		results.textContent = "";
		var template = this.querySelector('[block-content="template"]').cloneNode(true);
		template.removeAttribute('block-content');
		Array.from(template.querySelectorAll('[block-id]')).forEach(function(node) {
			node.removeAttribute('block-id');
		});
		if (this.dataset.nocall == "true") {
			matchdom(template, {
				$query: vars
			}, HTMLElementQuery.filters);
			while (template.firstChild) results.appendChild(template.firstChild);
			this._refreshing = false;
			return;
		}
		form.classList.remove('success', 'error', 'warning', 'loading');
		form.classList.add('loading');
		return Pageboard.fetch('get', '/.api/query', vars).then(function(answer) {
			answer.$query = vars;
			matchdom(template, answer, HTMLElementQuery.filters, answer);
			while (template.firstChild) results.appendChild(template.firstChild);
			if (!answer.data || answer.data.length === 0) {
				form.classList.add('warning');
			} else {
				form.classList.add('success');
			}
		}.bind(this)).catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
			this._refreshing = false;
		}.bind(this));
	}
}

HTMLElementQuery.filters = {};
HTMLElementQuery.filters.title = function(val, what) {
	// return title of repeated key, title of anyOf/listOf const value
	if (val === undefined) return;
	var path = what.scope.path.slice();
	var cur = what.expr.path.slice();
	if (what.scope.alias && cur[0] == what.scope.alias) {
		cur.shift();
	}
	path = path.concat(cur);
	var block, last;
	if (what.scope.keys) {
		last = path.pop();
		if (last == "key") {
			path.push(val);
			val = undefined;
		} else if (last == "val") {
			var key = what.scope.data[what.scope.index].key;
			path.push(key);
		}
		block = what.data;
	} else {
		block = what.scope.data;
	}
	for (var i=0; i < path.length; i++) {
		if (!block || block.id && block.type) break;
		block = block[path[i]];
	}
	if (!what.scope.keys) path = path.slice(i);

	if (!block || !block.type) {
		console.warn("No block found matching", what.scope.path, what.expr.path);
		return;
	}
	var schemaPath = 'schemas.' + block.type + '.properties.' + path.join('.properties.');
	var schema = what.expr.get(what.data, schemaPath);
	if (!schema) {
		console.warn("No schema for", schemaPath);
		return;
	}
	if (val === undefined && schema.title) return schema.title;
	var listOf = schema.oneOf || schema.anyOf;
	if (!listOf) {
		if (last == "val") return val;
		console.warn("No oneOf/anyOf schema for property of", schemaPath, val);
		return;
	}
	var prop = listOf.find(function(item) {
		return item.const === val; // null !== undefined
	});
	if (prop != null) return prop.title;
};
HTMLElementQuery.filters.checked = function(val, what, selector) {
	var ret = what.filters.attr(val === true ? 'checked' : null, what, 'checked', selector);
	if (val !== true) delete what.attr;
	return ret;
};
HTMLElementQuery.filters.sum = function(obj, what, ...list) {
	var sum = 0;
	if (obj == null) return sum;
	list.forEach(function(str) {
		var sign = 1;
		if (str.startsWith('-')) {
			sign = -1;
			str = str.substring(1);
		}
		var curVal = what.expr.get(obj, str);
		if (curVal != null && typeof curVal == "number") sum += sign * curVal;
	});
	return sum;
};
HTMLElementQuery.filters.query = function(val, what, name) {
	var q = Object.assign({}, what.data.$query);
	for (var key in q) if (key[0] == "_") delete q[key];
	q[name] = val;
	return Page.format({pathname: "", query: q});
};

HTMLCustomElement.define('element-query', HTMLElementQuery);
