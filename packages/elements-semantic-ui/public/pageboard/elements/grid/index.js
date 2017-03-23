(function(exports) {

if (!exports.grid) exports.grid = {};
exports.grid.title = "Grid";
exports.grid.properties = {};
exports.grid.contents = {
	columns: {
		spec: "grid_column+",
		title: 'Columns'
	}
};
exports.grid.menu = 'layout';
exports.grid.group = "block";

if (!exports.grid_column) exports.grid_column = {};
exports.grid_column.title = "Column";
exports.grid_column.properties = {
	width: {
		title: 'Column width',
		description: 'Between 1 and 16, set to 0 for auto',
		type: "integer",
		default: 0,
		minimum: 0,
		maximum: 16
	}
};
exports.grid_column.contents = {
	content: {
		spec: "block+",
		title: 'Content'
	}
};
exports.grid_column.menu = 'layout';

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

