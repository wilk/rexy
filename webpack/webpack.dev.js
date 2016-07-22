module.exports = {
    entry: ['./index.ts'],
    output: {
        filename: 'rexy.js',
        path: 'dist'
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