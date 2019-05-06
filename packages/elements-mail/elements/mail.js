Pageboard.elements.mail = {
	priority: -100,
	replaces: 'doc',
	title: 'Mail',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	standalone: true, // besides site, can be child of zero or more parents
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
		}
	},
	contents: {
		body: {
			spec: 'mail_body'
		}
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
	scripts: Pageboard.elements.page.scripts.slice().concat([
		'../lib/inlineresources.js',
		'../lib/europa.js',
		'../lib/juice.js',
		'../ui/mail.js'
	]),
	stylesheets: [
		'../lib/foundation-emails.css',
		'../ui/mail.css'
	]
};

Pageboard.elements.mail_body = {
	title: "Body",
	contents: {
		content: {
			spec: "mail_block+"
		}
	},
	html: `<table class="body">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};

Pageboard.elements.mail_container = {
	title: "Container",
	icon: '<b class="icon">Co</b>',
	contents: {
		content: {
			spec: "mail_block+",
			title: 'content'
		}
	},
	group: "mail_block",
	html: `<table class="container" align="center">
		<tr>
			<td block-content="content"></td>
		</tr>
	</table>`
};

