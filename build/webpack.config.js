'use strict';

const webpackConfig = {};

webpackConfig.entry = {
    'assets/main': './src/main.js',
    'assets/vendor': ['promise-polyfill', 'whatwg-fetch']
}

webpackConfig.output = {
    path: resolve('dist'), //打包后的文件存放的地方
    publicPath: '/',
    filename: '[name]-[hash:5].js', //打包后输出文件的文件名
    chunkFilename: 'assets/[name].[chunkhash:5].chunk.js',
    sourceMapFilename: "sourcemaps/[file].map",
}


webpackConfig.module = {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
}
  
  webpackConfig.module.rules.push(
    {
      test: /\.woff(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]', limit: 10000, mimetype: 'application/font-woff' }
        }
      ]
    },
    {
      test: /\.woff2(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]', limit: 10000, mimetype: 'application/font-woff2' }
        }
      ]
    },
    {
      test: /\.otf(\?.*)?$/,
      use: [
        {
          loader: 'file-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]', limit: 10000, mimetype: 'font/opentype' }
        }
      ]
    },
    {
      test: /\.ttf(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]', limit: 10000, mimetype: 'application/octet-stream' }
        }
      ]
    },
    {
      test: /\.eot(\?.*)?$/,
      use: [
        {
          loader: 'file-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]' }
        }
      ]
    },
    {
      test: /\.svg(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          options: { prefix: 'fonts/', name: '[path][name].[ext]', limit: 10000, mimetype: 'image/svg+xml' }
        }
      ]
    },
    {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: 'url-loader',
          options: { name: 'assets/images/[hash:8].[name].[ext]', limit: 8192 }
        }
      ]
    }
  )
  
  //set NODE_ENV=production&&babel-node bin/compile中，&&前面不能有空格，否则env === 'production'为false
  //开发环境使用ExtractTextPlugin插件，会导致语法错误没法提示
  if(env === 'production'){
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader','postcss-loader']
      })
    })
  
    webpackConfig.module.rules.push({
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          {
            loader: 'less-loader',
            options: {
              // 此处调用的是less.modifyVars
              // 在webpack1版本中的写法：
              // loader: ExtractTextPlugin.extract("style", "css!postcss!less-loader?" +`{"modifyVars":${JSON.stringify(theme)}}`)
              modifyVars: theme
            }
          }
        ]
      })
    })
  } else {
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ['style-loader','css-loader','postcss-loader']
    })
  
    webpackConfig.module.rules.push({
      test: /\.less$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
        {
          loader: 'less-loader',
          options: {
            modifyVars: theme
          }
        }
      ]
    })
  }
  
  webpackConfig.resolve = {
    alias: {
      common: path.resolve(__dirname, '../src/common/'), 
      containers: path.resolve(__dirname, '../src/containers/'),    
      components: path.resolve(__dirname, '../src/components/'),    
      constants: path.resolve(__dirname, '../src/constants/'),    
      layouts: path.resolve(__dirname, '../src/layouts/'),    
      middleware: path.resolve(__dirname, '../src/middleware/'),    
      modules: path.resolve(__dirname, '../src/modules/'),    
      res: path.resolve(__dirname, '../src/res/'),    
      routes: path.resolve(__dirname, '../src/routes/'),    
      store: path.resolve(__dirname, '../src/store/'),    
      images: path.resolve(__dirname, '../src/res/images'),    
      utils: path.resolve(__dirname, '../src/utils/')   
    }
  };
  
  if(env !== 'production'){
    webpackConfig.devServer = {
      host: '0.0.0.0', //加上这个配置才能让别人访问你的本地服务器
      contentBase: './dist', //本地服务器所加载的页面所在的目录
      port: 8000,
      historyApiFallback: true, //不跳转
      inline: true, //实时刷新
      //代理到json-server的端口，模拟后端接口
      proxy: {
        '/api/*': {
          target: 'http://localhost:8001',
          secure: false,
          changeOrigin: true,
          pathRewrite: {
            '^/api/': '/'
          },
        }
      }
    };
  }
  
  webpackConfig.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    //see => https://github.com/webpack/docs/wiki/list-of-plugins#commonschunkplugin
    new CommonsChunkPlugin({
      name: 'assets/main',
      filename: 'assets/common-[hash:5].js',
      children : true,
      minChunks: 3
    }),
    //see => https://github.com/webpack/docs/wiki/list-of-plugins#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      drop_console: env === 'production',
      // sourceMap: true
      // compress: {
      //   warnings: false,   // webpack3 已经默认为false
      // },
    }),
    //see => https://github.com/webpack/docs/wiki/list-of-plugins#htmlwebpackplugin-
    new HtmlwebpackPlugin({
      filename: 'index.html',
      favicon : 'src/res/favicon.ico',
      template: 'src/index.html',
      chunks: ['assets/vendor', 'assets/main']
    }),
  
    new webpack.DefinePlugin({
      __DEV__: env === 'development',
      __TEST__: env === 'test',
      __PRD__ : env === 'production'
    })
  ];
  
  if(env === 'production'){
    //see => https://www.npmjs.com/package/extract-text-webpack-plugin
    webpackConfig.plugins.push(
      new ExtractTextPlugin({
        filename: '[name]-[hash:5].css',
        allChunks : true
      })
    )
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: env === 'development',
        __TEST__: env === 'test',
        __PRD__ : env === 'production',
        'process.env': {
           NODE_ENV: JSON.stringify("production")
        }
      })
    )
    webpackConfig.plugins.push(
      new CopyWebpackPlugin([{
        from: path.resolve(__dirname, '../src/example'),
        to: path.resolve(__dirname, '../dist/example'),
      }])
    )
  }
  
  // webpackConfig.devtool = 'source-map';

module.exports = webpackConfig;