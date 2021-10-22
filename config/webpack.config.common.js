'use strict';
const fs = require('fs');
const path = require('path');

const { CleanWebpackPlugin }   = require('clean-webpack-plugin');
const HtmlWebpackPlugin    = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');
const customProperties = require('postcss-custom-properties');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const { SourceMapDevToolPlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const SandboxExternalPlugin = require('webpack-sandbox-external-plugin');
const helpers              = require('./helpers');
const isDev                = process.env.NODE_ENV !== 'production';

const minimizeCss = false;
const baseHref = "";
const deployUrl = "";
const isProd = (process.env.NODE_ENV === 'production');
const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
//add all external css to be added in our index.html--> like as if it's .angular-cli.json
const styles = [
  './src/styles.scss'
];
//create file path for each , so we use for our excludes and includes where needed
let style_paths = styles.map(style_src => path.join(process.cwd(), style_src));
//we add all our external scripts we want to load externally, like inserting in our index.html --> like as if it's .angular-cli.json
const scripts = [  './src/assets/**' ];

const postcssPlugins = function () {
  // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
  const importantCommentRe = /@preserve|@license|[@#]\s*source(?:Mapping)?URL|^!/i;
  const minimizeOptions = {
      autoprefixer: false,
      safe: true,
      mergeLonghand: false,
      discardComments: { remove: (comment) => !importantCommentRe.test(comment) }
  };
  return [
      postcssUrl({
          url: (obj) => {
            if (!obj.url.startsWith('/') || obj.url.startsWith('//')) {
              return obj.url;
            }
            if (deployUrl.match(/:\/\//)) {
              // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
              return `${deployUrl.replace(/\/$/, '')}${obj.url}`;
            }
            else if (baseHref.match(/:\/\//)) {
              // If baseHref contains a scheme, include it as is.
              return baseHref.replace(/\/$/, '') +
                `/${deployUrl}/${obj.url}`.replace(/\/\/+/g, '/');
            }
            else {
              // Join together base-href, deploy-url and the original URL.
              // Also dedupe multiple slashes into single ones.
              return `/${baseHref}/${deployUrl}/${obj.url}`.replace(/\/\/+/g, '/');
            }
          }
      }),
      autoprefixer(),
      customProperties({ preserve: true })
  ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
};

module.exports = {
  watch:true,
    devServer: {
      historyApiFallback: true,
      // Execute custom middleware after all other middleware internally within the server
      after() {
          // Fix whitescreen bug on build with Electron BrowserWindow
         // exec('electron . --dev');
      }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',        
		   test(module, chunks) {           
            return module.resource
                  && (module.resource.startsWith(nodeModules)
                      || module.resource.startsWith(genDirNodeModules)
                      || module.resource.startsWith(realNodeModules));
          }
		  
        },
		common:{
			name: 'common',
			"minChunks": 2,
			 chunks: 'async',    			
		},
		inline:{
				name: 'inline',
				"minChunks": 1
		}
      }
    }
  },
  
 
    entry: {      
         polyfills:  path.resolve(helpers.root()+'/src/polyfills.ts'),
         main: path.resolve(helpers.root()+'/src/main.ts') ,    
        "styles": styles
    }, 
    "resolve": {
      "extensions": [
        ".ts",
        ".js",
        ".scss",
        ".json",
        ".css"
      ],
      "aliasFields": [],
      "alias": { // WORKAROUND See. angular-cli/issues/5433
        "environments": isProd ? path.resolve(helpers.root(), 'src/environments/index.prod.ts') : path.resolve(helpers.root(), 'src/environments/index.ts')
       
      },
      "modules": [
        "./node_modules"
      ],
      "mainFields": [
        "browser",
        "module",
        "main"
      ]
    },
    "resolveLoader": {
      "modules": [
        "./node_modules"
      ]
    },
    module: {
        rules: [
          {
              test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|xml|ico|cur|ani)$/,
              "use": ["file-loader?name=[path][name].[ext]"]
            },           
            {
              test: /\.html$/,
              loader: 'html-loader'
           },     
           // Ignore warnings about System.import in Angular
           { 
            test: /[\/\\]@angular[\/\\].+\.js$/, 
            parser: { 
                system: true 
            }
        },
        {
          test: /\.(scss|sass)$/,
          use: [
              { loader: 'style-loader' },
              { loader: 'css-loader', options: { sourceMap: isDev } },
              { loader: 'sass-loader', options: { sourceMap: isDev } }
          ],
          include: style_paths
      },
      {
          test: /\.(scss|sass)$/,
          use: [
              'to-string-loader',
              { loader: 'css-loader', options: { sourceMap: isDev } },
              { loader: 'sass-loader', options: { sourceMap: isDev } }
          ],
          include: helpers.root('src', 'app')
      },
      {
        "exclude": style_paths,
        "test": /\.css$/,
        "use": [
        
          {
            "loader": "file-loader",
            options:{
              name: './src/assets/css/'+'/[name].css'              
            }
          }  ,
     
          {
            "loader": "css-loader",
            "options": {
              "sourceMap": false,
              "importLoaders": 1,                   
            }
          },
          {
            "loader": "postcss-loader",
            "options": {
              "ident": "postcss",
              "plugins": postcssPlugins
            }
          }
        ]
      }  
        ]
    },

    plugins: [
     
      new SandboxExternalPlugin(
        'commonjs', // output type
        ['process','fs', 'electron', 'os', 'buffer', 'child_process','dns'], // modules to externalize
      ),
     
      new CopyWebpackPlugin(
        {
         patterns: [
          {
            "context": "src",
            "to": "src/assets/",
            "from": "./assets/",
           "globOptions": {
                  dot: true
           }
           },	
         
         ],
      },
        {
          "ignore": [
            ".gitkeep"
          ],
          "debug": "warning"
        }),
        new HtmlWebpackPlugin({
          "template":  path.resolve(helpers.root()+'/src/index.html'),
         // "filename": "./index.html",
         "hash": false,
         "inject": true,
         "compile": true,
         "favicon": false,
         "minify": false,
         "cache": true,
         "showErrors": true,
         "chunks": "all",
         "excludeChunks": [],
         "title": "Webpack App",
         "xhtml": true,         
    chunksSortMode: (chunk1, chunk2) => {
        // Set the order of files injected (dependencies before app)
        // https://github.com/jantimon/html-webpack-plugin/issues/481
        let orders = ["polyfills",  'main'];
        return orders.indexOf(chunk1) - orders.indexOf(chunk2);
    }
        }),
        new CircularDependencyPlugin({
          "exclude": /(\\|\/)node_modules(\\|\/)/,
          "failOnError": false
        }),
        
          new AngularCompilerPlugin({
            "mainPath": "main.ts",
            "platform": 0,
            "sourceMap": true,
            "tsConfigPath": path.resolve(helpers.root('src'),"tsconfig.app.json"),
            "skipCodeGeneration": true,
            "compilerOptions": {},
            "hostReplacementPaths": {
              "environments/index.ts": "environments/index.ts"
            },
            "exclude": []
          }),
          new SourceMapDevToolPlugin({
            "filename": "[file].map[query]",
            "moduleFilenameTemplate": "[resource-path]",
            "fallbackModuleFilenameTemplate": "[resource-path]?[hash]",
            "sourceRoot": "webpack:///"
          }),     
         new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 6,
          },
        }) 
    ],
  
};