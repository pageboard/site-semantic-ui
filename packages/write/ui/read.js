Page.setup(function(state) {
	var it = window.parent.Pageboard;
	if (!it || !it.adopt || !state.data.$cache) return;
	it.adopt(window, state);
});

Page.patch(function(state) {
	var it = window.parent.Pageboard;
	state.push = function(url, opts) {
		var active = it.editor && !it.editor.closed;
		if (active) return Promise.resolve();
		var obj = typeof url == "string" ? Page.parse(url) : url;
		if (!obj.query) obj.query = {};
		obj.query.develop = this.query.develop;
		if (Page.samePathname(this, Page.format(obj))) obj.data = this.data;
		return Object.getPrototypeOf(this).push.call(this, obj, opts);
	};
	state.replace = function(url, opts) {
		var active = it.editor && !it.editor.closed;
		var obj = typeof url == "string" ? Page.parse(url) : url;
		if (!obj.query) obj.query = {};
		obj.query.develop = this.query.develop;
		if (Page.samePathname(this, Page.format(obj))) obj.data = this.data;
		return Object.getPrototypeOf(this).replace.call(this, obj, opts);
	};
});