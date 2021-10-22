'use strict';

const webpackMerge            = require('webpack-merge');
const ngw                     = require('@ngtools/webpack');
const UglifyJsPlugin          = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano                 = require('cssnano');

const commonConfig            = require('./webpack.config.common');
const helpers                 = require('./helpers');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = webpackMerge(commonConfig, {
    mode: 'production',

    output: {
        path: helpers.root('dist'),
      //  publicPath: '/',
        filename: '[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    optimization: {
        noEmitOnErrors: true,
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: 'single',
        minimizer: [
            // new UglifyJsPlugin({
            //     cache: true,
            //     parallel: true
            // }),
            // new MiniCssExtractPlugin({
            //           filename: `components/[name].css`
            //        }),
            // new OptimizeCSSAssetsPlugin({
            //     cssProcessor: cssnano,
            //     cssProcessorOptions: {
            //         discardComments: {
            //             removeAll: true
            //         }
            //     },
            //     canPrint: false
            // })
        ]
    },

    module: {
        rules: [
            
            // {
            //     test: /\.css$/,
            //     use:[
            //         {
            //             loader: MiniCssExtractPlugin.loader
            //         },
            //         "css-loader"
            //     ]
               
            //   },
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: helpers.root('src/tsconfig.app.json')
                        }
                    },
                    'angular2-template-loader',
                    'angular-router-loader'
                ],
                exclude: [/node_modules/]
            }
        ]
    },

    plugins: [
        new ngw.AngularCompilerPlugin({
            tsConfigPath: helpers.root('src/tsconfig.app.json'),
            "mainPath": "main.ts",
            "platform": 0,
            "sourceMap": true,
            "skipCodeGeneration": true,
            "hostReplacementPaths": {
                "environments/index.ts": "environments/index.prod.ts"
              },
           // entryModule: helpers.root('src', 'app', 'app.module#AppModule')
        })
    ]
});