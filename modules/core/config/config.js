/**
 * Configurações do app
 * 
 * @author 	Adriano Moura
 */
'use strict'
/**
 * Configure aqui:
 * - Idioma padrão
 * - Debug padrão
 * - Salt padrão
 */
module.exports = {
	"language": "ptBR",
	'debug': true,
	'versao': '0.1.',
	'log_sql': true,
	'sistema': 'App Padrão',
	'cache': {"time": 10000, "dir": ROOT + '/tmp/cache'},
	'salt': '26365e4abf1f45c0da1a8f547bc4180903800b12cd37efe82375884d73a6f7ed20877246fe6cdcd85b1bffd62c9aaa0768a6336196bcfe28247bb6f8b8f49f3f'
}