Pageboard.elements.accordion = {
	priority: 2, // scripts must run after 'query' scripts
	title: "Accordion",
	icon: '<i class="caret right icon"></i>',
	menu: 'widget',
	group: "block",
	contents: {
		folds: {
			spec: "fold+"
		}
	},
	html: '<element-accordion class="ui accordion" block-content="folds"></element-accordion>',
	stylesheets: [
		'../lib/components/accordion.css',
		'../ui/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};


Pageboard.elements.fold = {
	title: "Fold",
	icon: '<i class="icons"><i class="caret right icon"></i><i class="corner add icon"></i></i>',
	menu: 'widget',
	contents: {
		title: {
			spec: "inline*",
			title: 'title'
		},
		content: {
			spec: 'block+',
			title: 'content'
		}
	},
	properties: {
		template: {
			title: 'Template',
			description: 'Query value template',
			type: 'string',
			context: 'query'
		}
	},
	html: `<div class="fold" data-template="[template|magnet]">
		<div class="title caret-icon" block-content="title">Title</div>
		<div class="content" block-content="content"></div>
	</div>`
};

