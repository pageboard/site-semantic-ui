Page.route(function(state) {
	var loader;
	if (state.data.$cache) {
		loader = Promise.resolve(state.data.$cache);
	} else {
		loader = Pageboard.fetch('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			develop: state.query.develop
		});
	}

	return Pageboard.bundle(loader, state).then(function(res) {
		state.data.$cache = res;
		state.scope.$page = res.item;
		var ext = state.pathname.split('/').pop().split('.');
		if (ext.length == 2 && res.item && res.item.type != ext[1]) {
			res.status = 400;
			res.statusText = "Invalid extension";
		}
		var node = Pageboard.render(res, state.scope);
		if (!node || node.nodeName != "BODY") {
			throw new Error("page render should return a body element");
		}
		var doc = node.ownerDocument;
		doc.replaceChild(node.parentNode, doc.documentElement);
		return doc;
	});
});
