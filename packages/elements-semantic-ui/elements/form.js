Pageboard.elements.query_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Query',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	properties: {
		url: {
			title: 'Target page',
			description: 'Can be empty to stay on same page',
			$helper: {
				name: 'href',
				filter: {
					type: ["link"]
				}
			}
			nullable: true,
			type: "string",
			format: "pathname",
			$helper: 'page'
		},
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			$helper: 'element'
			nullable: true,
			type: 'string',
			format: 'id',
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	tag: 'form[method="get"]',
	html: `<form is="element-form" class="ui form" action="[url]" method="get" data-type="[type]" block-content="form"></form>`,
	stylesheets: [
		'../lib/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../lib/formdata.js',
		'../ui/form.js'
	],
	polyfills: ['fetch'] // unfortunately there is no formdata polyfill available right now
};

Pageboard.elements.api_form = {
	priority: 0, // scripts must run before 'query' scripts
	title: 'Form Submit',
	icon: '<i class="write icon"></i>',
	group: 'block form',
	menu: "form",
	required: ["request"],
	properties: {
		type: {
			title: 'Bind to element',
			description: 'Checks schema and helps adding form controls',
			$helper: 'element'
			nullable: true,
			type: 'string',
			format: 'id',
		},
		request: {
			title: 'Request',
			type: 'object',
			required: ["method"],
			properties: {
				method: {
					title: 'Method',
					nullable: true,
					type: "string",
					pattern: "^(\\w+\\.\\w+)?$"
				},
				parameters: {
					title: 'Parameters',
					nullable: true,
					type: "object"
				}
			},
			$filter: {
				name: 'service',
				action: "write"
			},
			$helper: 'service',
		},
		redirect: {
			title: 'Redirect',
			description: 'Select a page, or leave empty',
			nullable: true,
			type: "string",
			format: "uri-reference",
			$helper: {
				name: 'page',
				title: 'Query',
				description: 'Values can be [$query.xxx], [$body.xxx], [$response.xxx]',
				query: true
			}
		}
	},
	contents: {
		form: {
			spec: 'block+'
		}
	},
	tag: 'form[method="post"]',
	html: `<form is="element-form" action="/.api/form/[$id]" type="[type]"
		redirect="[redirect]"
		method="post"
		class="ui form"
		id="[name|or:[$id|slice:0:4]]"
		block-content="form"></form>`,
	stylesheets: [
		'../lib/components/form.css',
		'../ui/form.css'
	],
	scripts: [ // for asynchronous submits and automatic triggers
		'../lib/formdata.js',
		'../ui/form.js'
	],
	polyfills: ['fetch'] // unfortunately there is no formdata polyfill available right now
};

