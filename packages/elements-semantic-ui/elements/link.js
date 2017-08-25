Pageboard.elements.link = {
	title: "Link",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		},
		target: {
			title: 'Target',
			description: 'Choose how to open link',
			default: "",
			oneOf: [{
				constant: "",
				title: "auto target"
			}, {
				constant: "_blank",
				title: "new window"
			}, {
				constant: "_self",
				title: "same window"
			}]
		},
		button: {
			title: 'Button',
			description: 'Show link as button',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		text: "text*"
	},
	inline: true,
	group: "inline",
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		var a = doc.dom`<a href="${block.data.url}" target="${block.data.target}"></a>`;
		if (block.data.button) a.className = 'ui button';
	},
	stylesheets: ['/.pageboard/semantic-ui/components/button.css']
};

