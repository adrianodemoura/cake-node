/**
 * Conexão com banco MongoDB
 *
 * @author  Adriano Moura
 */
'use strict'
/**
 * Mantém a conexão com o banco mongoDB
 * A configuração de conexão fica no arquivo config_[ambiente].
 */
 
const mongoose  	= require('mongoose');
const configMongo	= require('./config/config_' + process.env.NODE_ENV)['data_sources']['mongo']

mongoose.Promise 	= global.Promise
mongoose.connect(configMongo.url, { useNewUrlParser: true, useCreateIndex: true })

// Connection messages
mongoose.connection
  .once('open', res => { console.log('MongoDB conectado.') })
  .on('error', err => { console.log(err.message); gravaLog('erro de conexão: '+err.message, 'error_mongodb') })

module.exports = mongoose