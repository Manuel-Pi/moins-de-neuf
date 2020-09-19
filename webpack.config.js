const webpack = require('webpack');
var OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
module.exports = {
    mode: "production",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    output:{
        libraryTarget: 'umd',
        globalObject: 'this'
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx",".js", ".jsx", ".less"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "style.css"
                        }
                    },
                    "extract-loader",
                    {
                        loader: "css-loader"
                    },
                    "less-loader"
                ]
            }
        ]
    },
    plugins:[
        /*new webpack.DefinePlugin({
            ENV_PORT: JSON.stringify(process.env.PORT),
        })*/
    ],
    optimization: {
        minimizer: [
          new OptimizeCSSAssetsPlugin({})
        ]
      }

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
/* externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }*/
}
