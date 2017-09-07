Pageboard.elements.menu = {
	title: "Menu",
	contents: {
		items: {
			spec: "menu_item+",
			title: 'Items'
		}
	},
	properties: {
		direction: {
			title: 'Direction',
			default: "",
			oneOf: [{
				constant: "",
				title: "horizontal"
			}, {
				constant: "vertical",
				title: "vertical"
			}, {
				constant: "compact",
				title: "compact"
			}]
		}
	},
	group: "block",
	icon: '<b class="icon">Menu</b>',
	render: function(doc, block, view) {
		var it = doc.dom`<div class="ui ${block.data.direction} menu" block-content="items"></div>`;
		return it;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/menu.css'
	],
	scripts: [
		'../ui/menu.js'
	]
};

Pageboard.elements.menu_item_link = {
	title: "Link Item",
	priority: 10,
	context: "menu//",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				media: ["link", "page"]
			}
		}
	},
	contents: {
		content: {
			spec: "inline*"
		}
	},
	group: 'menu_item',
	icon: '<b class="icon">Item</b>',
	render: function(doc, block) {
		var dom = Pageboard.elements.link.render(doc, block);
		dom.className = "item";
		dom.setAttribute('block-content', 'content');
		return dom;
	}
};

Pageboard.elements.menu_item_dropdown = {
	title: "Dropdown",
	priority: 11,
	context: "menu//",
	contents: {
		title: {
			spec: "text*",
			title: "Title"
		},
		items: {
			spec: "menu_item+",
			title: 'Items'
		}
	},
	group: "menu_item",
	icon: '<b class="icon">Pop</b>',
	render: function(doc, block, view) {
		// the empty div is only here to wrap
		return doc.dom`<div class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div>
				<span block-content="title"></span>
				<i class="dropdown icon"></i>
			</div>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/dropdown.css'
	]
};
