exports.mail = {
	priority: -100,
	title: 'Mail',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	properties: {
		title: {
			title: 'Title',
			nullable: true,
			type: "string",
			format: "singleline",
			$helper: 'pageTitle'
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "^(/[a-zA-Z0-9-]*)+$",
			$helper: 'pageUrl' // works with sitemap editor to update pages url in a coherent manner
			// see also page.save: the href updater will only change input.name == "href".
		},
		index: {
			type: "integer",
			default: 0,
			minimum: 0
		}
	},
	contents: {
		id: 'body',
		nodes: 'mail_body'
	},
	html: `<html lang="[$site.lang|ornull]">
	<head>
		<title>[$site.title|post:%3A |or:][title]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="[$elements.mail.stylesheets|repeat]" />
		<script defer src="[$elements.mail.scripts|repeat]"></script>
	</head>
	<body block-content="body"></body>
</html>`,
	scripts: exports.page.scripts.slice(),
	stylesheets: [
		'../lib/foundation-emails.css',
		'../ui/mail.css'
	]
};

exports['.mail'] = {
	prerender: {
		mime: 'application/json',
		display: false,
		fonts: false,
		medias: true
	},
	scripts: [
		'../lib/inlineresources.js',
		'../lib/europa.js',
		'../lib/juice.js',
		'../ui/mail.js'
	]
};

exports.mail_body = {
	title: "Body",
	contents: {
		id: 'content',
		nodes: "mail_block+"
	},
	html: `<table class="body">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};

exports.mail_container = {
	title: "Container",
	icon: '<b class="icon">Co</b>',
	contents: {
		id: 'content',
		nodes: "mail_block+"
	},
	group: "mail_block",
	html: `<table class="container" align="center">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};
