(function(exports) {

exports.link = {
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
		}
	},
	inline: true,
	group: "inline",
	icon: '<i class="icon linkify"></i>',
	view: function(doc, block) {
		return doc.dom`<a href="${block.data.url}" target="${block.data.target}">new link</a>`;
	}
};

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

