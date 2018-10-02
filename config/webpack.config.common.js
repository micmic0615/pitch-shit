'use strict';

const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const autoprefixer = require('autoprefixer');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');
const webpack = require('webpack');
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const extractTextPluginOptions = shouldUseRelativeAssetPaths ? { publicPath: Array(cssFilename.split('/').length).join('../') } : {};

module.exports = {
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.(js|jsx|mjs)$/,
				enforce: 'pre',
				use: [
					{
					options: {
						formatter: eslintFormatter,
						eslintPath: require.resolve('eslint'),
						
					},
					loader: require.resolve('eslint-loader'),
					},
				],
				include: paths.appSrc,
				},
			{
			oneOf: [
				{
					test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
					loader: require.resolve('url-loader'),
					options: {
						limit: 10000,
						name: 'static/media/[name].[hash:8].[ext]',
					},
				},
				{
					test: /\.(js|jsx|mjs)$/,
					include: paths.appSrc,
					loader: require.resolve('babel-loader'),
					options: {
						compact: true,
					},
				},
				{
					test: [/\.css$/, /\.scss$/],
					loader: ExtractTextPlugin.extract(
						Object.assign({
							fallback: {
							loader: require.resolve('style-loader'),
							options: {
								hmr: false,
							},
							},
							use: [
							{
								loader: require.resolve('css-loader'),
								options: {
								importLoaders: 1,
								minimize: true,
								sourceMap: shouldUseSourceMap,
								},
							},
							{
								loader: require.resolve('sass-loader'),
								options: {
									includePaths: ["absolute/path/a", "absolute/path/b"]
								}
							},
							{
								loader: require.resolve('postcss-loader'),
								options: {
									ident: 'postcss',
									plugins: () => [
										require('postcss-flexbugs-fixes'),
										autoprefixer({
										browsers: [
											'>1%',
											'last 4 versions',
											'Firefox ESR',
											'not ie < 9',
										],
										flexbox: 'no-2009',
										}),
									],
								},
							},
							],
						},extractTextPluginOptions)
					),
				},
				{
					loader: require.resolve('file-loader'),
					exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
					options: {
						name: 'static/media/[name].[hash:8].[ext]',
					},
				},
			],
			},
		],
	},
	resolve: {
		modules: ['node_modules', paths.appNodeModules].concat(
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),
		extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
		alias: {
			"Src": path.resolve(__dirname, "../src/"),
			"Pages": path.resolve(__dirname, "../src/pages/"),
			"Home": path.resolve(__dirname, "../src/pages/Home/"),
			"Partials": path.resolve(__dirname, "../src/partials/"),
			"Actions": path.resolve(__dirname, "../src/actions/"),
			"Reducers": path.resolve(__dirname, "../src/reducers/"),
			"Assets": path.resolve(__dirname, "../src/assets/"),
			"Elements": path.resolve(__dirname, "../src/elements/"),
			"Constants": path.resolve(__dirname, "../src/constants/"),
			// "ApiMocks": path.resolve(__dirname, "../src/apimocks/"),
			// "Components": path.resolve(__dirname, "../src/components/"),
			// "Containers": path.resolve(__dirname, "../src/containers/"),
			// "Modules": path.resolve(__dirname, "../src/modules/"),
			
			// "Services": path.resolve(__dirname, "../src/services/"),
			// "Utilities": path.resolve(__dirname, "../src/utilities/"),
		},
		plugins: [
			new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			_: path.resolve(__dirname, "./../src/assets/scripts/lodashExtended.js"),
			DESKTOP: path.resolve(__dirname, "./../src/assets/scripts/desktopGlobals.js"),
			Pitch: path.resolve(__dirname, "./../config/public/js/pitch.js"),
		}),
	]
}
