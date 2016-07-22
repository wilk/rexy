module.exports = {
    entry: ['./examples/example.ts'],
    output: {
        filename: 'example.js',
        path: 'examples'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js', '.json']
    },
    resolveLoader: {
        modulesDirectories: ["node_modules"]
    },
    devtool: "source-map",
    module: {
        loaders: [
            // note that babel-loader is configured to run after ts-loader
            {test: /\.ts(x?)$/, loader: 'babel-loader!ts-loader'}
        ]
    }
};