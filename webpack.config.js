const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    // Enable sourcemaps for debugging webpack's output.
    devtool: "eval-source-map",

    context: path.resolve(__dirname),
    
    output:{
        libraryTarget: 'umd',
        globalObject: 'this',
        publicPath: '/moins-de-neuf-dev'
    },
    
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx",".js", ".jsx", ".less"],
        alias: {
            react: path.join(__dirname, "node_modules/react")
        }
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
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
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
          
                        },
                      },
                    "css-loader",
                    "less-loader"
                ]
            },
            {
                test: /node_modules.*\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
           
                        },
                      },
                    "css-loader",
                    "less-loader"
                ]
            }
        ]
    },
    plugins:[
        /*new webpack.DefinePlugin({
            ENV_PORT: JSON.stringify(process.env.PORT),
        }),*/
        new CopyPlugin({
            patterns: [
                "src/index.html",
                "src/icon.png",
                {
                    from: "src/server",
                    to: "server"
                }
            ],
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: 'style.css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        })
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            '...'
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

/*
module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = "eval-source-map"
        config.optimization.minimize = false
    }
  
    if (argv.mode === 'production') {

    }
  
    return config;
}*/
  