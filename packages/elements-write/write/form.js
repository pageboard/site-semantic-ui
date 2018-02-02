(function(Pageboard, Pagecut) {

Pageboard.Controls.Form = Form;


function Form(editor, node) {
	this.editor = editor;
	this.node = node;
	this.inlines = [];
}

Form.prototype.destroy = function() {
	if (this.main) {
		this.main.destroy();
		delete this.main;
	}
	this.inlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = [];
};

Form.prototype.update = function(parents, sel) {
	if (!parents.length) {
		this.clear();
		return;
	}
	var parent = parents[0];

	var block = parent.block;
	if (!block) {
		this.destroy();
		return;
	}

	if (this.main && block != this.main.block) {
		this.main.destroy();
		delete this.main;
	}

	if (!this.main) this.main = new FormBlock(this.editor, this.node, block);
	this.main.update();

	var curInlines = this.inlines;
	var inlines = (parent.inline && parent.inline.blocks || []).map(function(block) {
		var type = block.type;
		var curForm;
		curInlines = curInlines.filter(function(form) {
			if (form.block.type == block.type) {
				curForm = form;
				return false;
			} else {
				return true;
			}
		});
		if (!curForm) curForm = new FormBlock(this.editor, this.node, block);
		else curForm.node.parentNode.appendChild(curForm.node);
		curForm.update(block);
		return curForm;
	}, this);
	curInlines.forEach(function(form) {
		form.destroy();
	});
	this.inlines = inlines;
};

function FormBlock(editor, parent, block) {
	this.node = parent.appendChild(document.createElement('div'));
	this.block = block;
	this.editor = editor;
	this.el = editor.element(block.type);
	if (!this.el) {
		throw new Error(`Unknown element type ${block.type}`);
	}
	this.changeListener = this.change.bind(this);
	this.node.addEventListener('change', this.changeListener);
	this.node.addEventListener('input', this.changeListener);
	this.form = new Semafor({
		type: 'object',
		properties: this.el.properties,
		required: this.el.required
	}, this.node);
	this.inputs = {};
}

FormBlock.prototype.destroy = function() {
	if (this.inputs) for (var name in this.inputs) {
		if (this.inputs[name].destroy) this.inputs[name].destroy();
	}
	this.inputs = {};
	this.node.removeEventListener('change', this.changeListener);
	this.node.removeEventListener('input', this.changeListener);
	this.node.remove();
};

FormBlock.prototype.update = function(block) {
	if (parent) this.parent = parent;
	this.ignoreEvents = true;
	if (block) {
		this.block = block;
	}
	this.form.clear();
	this.form.set(this.block.data);
	this.ignoreEvents = false;
	if (this.el.properties) this.propInputs(this.el.properties);
};

FormBlock.prototype.propInputs = function(props, parentKey) {
	var node = this.node;
	var block = this.block;
	Object.keys(props).forEach(function(key) {
		var prop = props[key];
		var opts = prop.input;
		if (!opts || !opts.name) {
			if (prop.properties) this.propInputs(prop.properties, key);
			return;
		}
		var CurInput = Pageboard.inputs[opts.name];
		if (!CurInput) {
			console.error("Unknown input name", Pageboard.inputs, prop);
			return;
		}
		var ikey = key;
		if (parentKey) ikey = `${parentKey}.${key}`;
		if (!this.inputs[ikey]) {
			this.inputs[ikey] = new CurInput(node.querySelector(`[name="${ikey}"]`), opts, prop, block);
		} else {
			this.inputs[ikey].update(block);
		}
	}, this);
};

FormBlock.prototype.change = function() {
	if (!this.block || this.ignoreEvents) return;
	var editor = this.editor;
	var data = this.form.get();

	var id = this.block.id;
	var found = false;

	// this must be done after reselecting with breadcrumb.click
	this.block.data = Object.assign(this.block.data || {}, data);

	if (id == editor.state.doc.attrs.id) {
		found = true;
		editor.pageUpdate(this.block);
	}

	var tr = editor.state.tr;
	tr.setMeta('pageboard', true);

	if (this.el.inplace) {
		// simply select focused node
		var node = this.el.inline ? this.parent.inline.rpos : editor.root.querySelector('[block-focused="last"]');
		if (node) {
			editor.utils.refreshTr(tr, node, this.block);
		}
	} else {
		var nodes = editor.blocks.domQuery(id, {all: true});

		if (nodes.length == 0) {
			if (!found) console.warn("No dom nodes found for this block", this.block);
		} else {
			nodes.forEach(function(node) {
				editor.utils.refreshTr(tr, node, this.block);
			});
		}
	}
	editor.dispatch(tr);
};

})(window.Pageboard, window.Pagecut);

