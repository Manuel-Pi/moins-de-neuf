const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const config = {
    mode: "production",
    devtool: false,

    context: path.resolve(__dirname),
    
    output:{
        libraryTarget: 'umd',
        globalObject: 'this',
        publicPath: '/moins-de-neuf/',
        clean: true
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
                        loader: "ts-loader",
                        options: {
                            allowTsInNodeModules: true
                        }
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
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            '...'
        ]
    },

    stats: 'minimal'
}

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = "eval-source-map"
        config.optimization.minimize = false
    }
    if(argv.json){
        config.stats = {
            chunkModules: true,
            chunkOrigins: true
        }
    }
    return config
}
  