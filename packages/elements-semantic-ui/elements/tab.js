Pageboard.elements.tabs = {
	title: "Tabs",
	icon: '<b class="icon">Tabs</b>',
	menu: 'widget',
	group: "block",
	contents: {
		items: {
			title: 'Menu',
			spec: "tab_item+"
		},
		tabs: {
			title: 'Tabs',
			spec: "tab+"
		}
	},
	properties: {
		style: {
			title: 'Style',
			anyOf: [{
				const: "tabular",
				title: "Tabular"
			}, {
				const: "pointing",
				title: "Pointing"
			}],
			default: 'tabular'
		}
	},
	render: function(doc, block) {
		var d = block.data;
		var style;
		switch (d.style) {
			case "pointing":
				style = "secondary pointing";
			break;
			default:
				style = "top attached tabular";
			break;
		}
		return doc.dom`<element-tabs>
			<div class="ui ${style} menu" block-content="items"></div>
			<div block-content="tabs"></div>
		</element-tabs>`;
	},
	stylesheets: [
		'../semantic-ui/tab.css',
		'../ui/tab.css'
	],
	scripts: [
		'../ui/tab.js'
	],
	resources: [
		'../ui/tab-helper.js'
	],
	install: function(doc, page, scope) {
		if (scope.$write) this.scripts = this.resources;
	}
};


Pageboard.elements.tab_item = {
	title: "Item",
	icon: '<i class="icons"><b class="icon">Tab</b><i class="corner add icon"></i></i>',
	menu: 'widget',
	inplace: true,
	context: 'tabs/tabs_container_items/',
	contents: {
		content: {
			spec: "text*"
		}
	},
	properties: {
		active: {
			type: 'boolean',
			default: false
		}
	},
	parse: function(dom) {
		var d = {};
		d.active = dom.previousElementSibling == null;
		return d;
	},
	html: '<a class="item [active|?]" block-content="content">Tab Item</a>'
};

Pageboard.elements.tab = {
	title: 'Tab',
	inplace: true,
	context: 'tabs/tabs_container_tabs/',
	contents: {
		content: "block+"
	},
	properties: {
		active: {
			type: 'boolean',
			default: false
		}
	},
	parse: function(dom) {
		var d = {};
		d.active = dom.previousElementSibling == null;
		return d;
	},
	html: '<div class="ui tab [active|?] segment" block-content="content"></div>'
};

