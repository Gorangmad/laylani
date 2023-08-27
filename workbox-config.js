module.exports = {
	globDirectory: 'serviceworker/',
	globPatterns: [
		'**/*.js'
	],
	swDest: 'serviceworker/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
		/^source/
	]
};