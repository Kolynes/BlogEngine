"use strict";

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let entry = {
	"sign-in": './src/sign-in.js',
	"account": './src/account.js',
}

let outputPath = __dirname + "/../static/BlogEngineApp/js"

module.exports = env => {
	let mode = env.production? "production" : "development"
	let plugins = [new VueLoaderPlugin()];
	if(env.uglify){
		plugins.push(
			new UglifyJSPlugin(),
		)
	}
	const config = {
		entry,
		output: {
			path: outputPath,
			filename: "[name].js"
		},
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader'
				},
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ["babel-preset-es2015"]
						}
					}
				},
				{
					test: /\.css$/,
					use: [
						{loader: 'vue-style-loader', options: { url: false }},
					  	{loader: 'css-loader', options: { url: false }}
					]
				},
				{
					test: /\.scss$/,
					use: [
						{loader: 'vue-style-loader', options: { url: false }},
					  	{loader: 'css-loader', options: { url: false }},
						'sass-loader',
					]
				}
			]
		},
		plugins
	};
	return config
}
