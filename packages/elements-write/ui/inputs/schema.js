(function(Pageboard) {
Pageboard.schemaFilters.schema = SchemaFilter;

function SchemaFilter(key, opts) {
	this.key = key;
	this.opts = opts;
}

SchemaFilter.prototype.update = function(block, schema) {
	if (!this.opts.path) {
		console.warn("$filter schema is missing path option");
		return;
	}
	var schemaPath = this.opts.path.split('.');
	var otherSchema = schemaPath.reduce(function(obj, name) {
		return obj[name] || null;
	}, Pageboard.editor.elements[schemaPath.shift()]);
	if (!otherSchema) {
		console.warn('$filter schema does not find', this.opts.path);
		return;
	}
	return Object.assign({}, otherSchema);
};

})(window.Pageboard);
