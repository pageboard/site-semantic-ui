exports.nav = {
	title: "Nav",
	icon: '<i class="icon hand pointer"></i>',
	menu: "link",
	description: "Navigation links",
	properties: {
		relation: {
			title: "relation",
			default: "up",
			anyOf: [{
				const: "up",
				title: "up"
			}, {
				const: "prev",
				title: "previous"
			}, {
				const: "next",
				title: "next"
			}]
		}
	},
	group: "block",
	html: `<a class="ui icon button [url|!?:disabled]" href="[url]" title="[title]">
		<i class="icon [rel]"></i>
	</a>`,
	fuse: function(node, d, scope) {
		var obj = (scope.$links || {})[d.relation] || {};
		if (d.relation == "up") {
			if (obj.length) obj = obj[0];
		}
		node.fuse({
			url: obj.url,
			title: obj.title,
			rel: d.relation,
		}, scope);
	}
};

exports.breadcrumb = {
	title: "Breadcrumb",
	icon: '<b class="icon">&gt;&gt;&gt;</b>',
	menu: "link",
	group: "block",
	html: `<nav class="ui breadcrumb">
		<div class="divider"></div>
		<a href="[$links.up.url|reverse|repeat:+a:link:-1]" class="section">[link.title]</a>
		<div class="divider"></div>
		<div class="active section">[$page.data.title|magnet:+div]</div>
	</nav>`,
	stylesheets: [
		'../lib/components/breadcrumb.css'
	]
};

