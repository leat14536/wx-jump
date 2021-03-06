/**
 * Created by Administrator on 2017/8/4 0004.
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = () => {
  return {
    entry: {
      index: './src/index.js',
      test: './src/test.js'
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name][hash].js'
    },
    resolve: {
      alias: {}
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test: /favicon.png$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        exclude: /favicon.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }]
      }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        chunks: ['index'],
        filename: 'index.html'
      }),
      new HtmlWebpackPlugin({
        template: './src/test.html',
        chunks: ['test'],
        filename: 'test.html'
      })
    ],
    devServer: {
      port: 8110,
      historyApiFallback: true
    }
  }
}
