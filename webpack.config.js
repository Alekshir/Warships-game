const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');

const mainThread = {
  entry: {
    main:'./src/main/index.ts',
    restore:'./src/main/indexRestorePass.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'server/build/public/')
  },

  mode: 'development',
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  plugins: [
    new MiniCssExtractPlugin(
      {
        filename:'./css/[name].css',
        chunkFilename: '[id].css'
      }
    )/*,
    new HtmlWebpackPlugin(
      {
        title:'Output Management'
      }
      )*/
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
          loader:MiniCssExtractPlugin.loader,
          options: {
            // you can specify a publicPath here
            // by default it uses publicPath in webpackOptions.output
           publicPath:'',
            //outputPath: path.resolve(__dirname, 'server/build/public/css')
          }
        },
          {
            loader: 'css-loader',
          }
        ]
      },
      {
        test: /\.(png|jpg|img|svg|mp3)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: "[name].[ext]",
              outputPath: '/img'
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }

    ]
  },
  optimization: {
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
       `...`,
      new CssMinimizerPlugin(),
    ],
  },

};

const webWorker = {
  target: "webworker",
  entry: {
    worker: path.resolve(__dirname, 'src/webworker/TimerWorker/TimerWorker.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'server/build/public')
  },

  mode: 'development',
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }]
  }
};

module.exports=[mainThread, webWorker];