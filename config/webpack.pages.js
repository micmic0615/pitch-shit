const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');

const generateHtmlPlugin = (name, title, test) => {
	return new HtmlWebpackPlugin({
		inject: true,
		filename: name,
		template: paths.appHtml,
		
		minify: {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeStyleLinkTypeAttributes: true,
			keepClosingSlash: true,
			minifyJS: true,
			minifyCSS: true,
			minifyURLs: true,
		},

		// title: title,
		// test: test,
	});
};

module.exports = [
	generateHtmlPlugin("../src/index.html")
];