exports.paragraph = {
	priority: -10,
	title: "Paragraph",
	icon: '<i class="icon paragraph"></i>',
	tag: 'p',
	isolating: false,
	properties: {
		align: {
			title: 'Align',
			nullable: true,
			anyOf: [{
				const: "left",
				title: "left",
				icon: '<i class="icon align left"></i>'
			}, {
				const: "center",
				title: "center",
				icon: '<i class="icon align center"></i>'
			}, {
				const: "right",
				title: "right",
				icon: '<i class="icon align right"></i>'
			}, {
				const: "justify",
				title: "justify",
				icon: '<i class="icon align justify"></i>'
			}]
		}
	},
	parse: function(dom) {
		var align;
		var prop = this.properties.align;
		if (dom.classList.contains("aligned")) {
			align = prop.anyOf.find(function(item) {
				return dom.classList.contains(item.const);
			});
			if (align) align = align.const;
		}
		return {align: align};
	},
	contents: "inline*",
	group: "block",
	inplace: true,
	html: '<p class="[align|post: aligned]">Text</p>'
};

