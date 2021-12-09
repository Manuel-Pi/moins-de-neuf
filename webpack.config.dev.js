const _require = id => require(require.resolve(id, { paths: [require.main.path] }))
const webpack = _require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript').default
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = {
    // Enable sourcemaps for debugging webpack's output.
    mode: "development",
    devtool: "eval-source-map",

    context: path.resolve(__dirname),

    entry: [
        "./src/index.tsx",
        path.join(require.main.path, 'node_modules/webpack-hot-middleware/client')
    ],
    
    output:{
        libraryTarget: 'umd',
        globalObject: 'this',
        publicPath: '/moins-de-neuf-dev'
    },
    
    resolve: {
        extensions: [".ts", ".tsx",".js", ".jsx", ".less"],
        alias: {
            react: path.join(__dirname, "node_modules/react")
        }
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            allowTsInNodeModules: true,
                            getCustomTransformers: () => ({
                                before: [ReactRefreshTypeScript()]
                            }),
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                test: /node_modules.*\.ts(x?)$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            allowTsInNodeModules: true
                        }
                    }
                ]
            },
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
        new CopyPlugin({
            patterns: [
                "src/index.html",
                "src/icon.png",
                "src/manifest.json",
                {
                    from: "src/server",
                    to: "server"
                }
            ],
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new ReactRefreshWebpackPlugin({
            overlay: {
                sockIntegration: "whm"
            }
        })
    ],

    optimization: {
        minimize: true
    },
    
    stats: {
        all: false,
        errors: true,
        errorDetails: "auto",
        builtAt: true
    }
}
  