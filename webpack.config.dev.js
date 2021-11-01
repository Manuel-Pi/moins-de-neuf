const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { AutomaticPrefetchPlugin } = require('webpack')

module.exports = {
    // Enable sourcemaps for debugging webpack's output.
    mode: "production",
    devtool: "eval-source-map",

    context: path.resolve(__dirname),
    
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
  