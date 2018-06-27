Pageboard.elements.sitemap = {
	title: "Site map",
	menu: "link",
	contents: {
		children: {
			spec: "sitemap_item+",
			virtual: true
		}
	},
	group: "block",
	icon: '<i class="icon sitemap"></i>',
	render: function(doc, block, view) {
		return doc.dom`<element-accordion class="ui accordion" block-content="children"></element-accordion>`;
	},
	mount: function(block, blocks, view) {
		if (!block.content) block.content = {};
		if (!block.content.children) {
			// restore might have already filled children
			block.content.children = view.doc.createDocumentFragment();
		}
		return fetch('/.api/pages', {credentials: "same-origin"}).then(function(res) {
			return res.json();
		}).then(function(obj) {
			var tree = {};
			obj.data.forEach(function(page) {
				if (!page.data.url) return;
				var storedPage = blocks[page.id];
				if (storedPage) {
					// do not overwrite the actual page object, use it for up-to-date render
					page = storedPage;
				} else {
					blocks[page.id] = page;
				}
				var branch = tree;
				var arr = page.data.url.substring(1).split('/');
				arr.forEach(function(name, i) {
					if (!branch[name]) branch[name] = {};
					branch = branch[name];
					if (i == arr.length - 1) branch._ = page;
				});
			});
			return tree;
		}).then(fillChildren).catch(function(err) {
			console.error(err);
		});

		function fillChildren(tree, parent) {
			if (!parent) parent = block;
			var page = tree._;
			if (page) {
				if (!parent.content) parent.content = {};
				if (!parent.content.children) {
					// restore might have already filled children
					parent.content.children = view.doc.createDocumentFragment();
				}
				var newChild = view.render(page, {
					type: `site${page.type}`
				});
				var existing = parent.content.children.querySelector(`[block-id="${page.id}"]`);
				if (existing) {
					// this is a workaround - block.content.children above should be empty...
					existing.replaceWith(newChild);
				} else {
					parent.content.children.appendChild(newChild);
				}
				delete tree._;
			} else {
				page = parent;
			}
			Object.keys(tree).sort(function(a, b) {
				var pageA = tree[a]._;
				var pageB = tree[b]._;
				if (!pageA || !pageB) return 0;
				var indexA = pageA.data.index;
				if (indexA == null) indexA = Infinity;
				var indexB = pageB.data.index;
				if (indexB == null) indexB = Infinity;
				if (indexA == indexB) return 0;
				else if (indexA < indexB) return -1;
				else if (indexA > indexB) return 1;
			}).forEach(function(name) {
				fillChildren(tree[name], page);
			});
		}
	},
	stylesheets: [
		'../semantic-ui/accordion.css',
		'../ui/sitemap.css'
	],
	resources: [
		'../ui/sitemap-helper.js'
	],
	install: function(doc, page, view) {
		if (Pageboard.write) this.scripts = this.resources;
	}
};

Pageboard.elements.sitepage = {
	title: "Page",
	menu: "link",
	group: 'sitemap_item',
	properties: Pageboard.elements.page.properties,
	contents: {
		children: {
			spec: "sitemap_item*",
			title: 'pages',
			virtual: true // this drops block.content.children, and all
		}
	},
	unmount: function(block, node) {
		// added pages NEED to have their type overriden
		block.type = 'page';
		var pos = 0;
		while (node=node.previousElementSibling) pos++;
		block.data.index = pos;
	},
	icon: '<i class="icon file outline"></i>',
	context: 'sitemap/ | sitepage/',
	render: function(doc, block) {
		return doc.dom`<element-sitepage class="item fold" data-url="${block.data.url}">
			<div class="title caret-icon">
				<span class="header">${block.data.title || 'Untitled'}</span><br />
				<a href="${block.data.url}" class="description">${block.data.url || '-'}</a>
			</div>
			<div class="list content ui accordion" block-content="children"></div>
		</element-sitepage>`;
	}
};

Pageboard.elements.sitemail = {
	title: "Mail",
	menu: "link",
	group: 'sitemap_item',
	get properties() {
		return Pageboard.elements.mail.properties;
	},
	unmount: function(block, node) {
		// added pages NEED to have their type overriden
		block.type = 'mail';
		var pos = 0;
		while (node=node.previousElementSibling) pos++;
		block.data.index = pos;
	},
	icon: '<i class="icon mail outline"></i>',
	context: 'sitemap/ | sitepage/',
	render: function(doc, block) {
		return doc.dom`<element-sitepage class="item" data-url="${block.data.url}">
			<div class="title">
				<span class="header">${block.data.title || 'Untitled'}</span><br />
				<a href="${block.data.url}" class="description">${block.data.url || '-'}</a>
			</div>
		</element-sitepage>`;
	}
};

