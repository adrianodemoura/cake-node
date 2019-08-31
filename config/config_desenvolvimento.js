/**
 * Configurações do app em desenvolvimento
 * 
 * @author 	Adriano Moura
 */
'use strict'
/**
 * Configure aqui:
 * - A porta do seu servidor.
 * - cache: tempo do cache (em dias), diretório do cache.
 * - Conexões com banco de dados: driver: host, user, password, database
 */
module.exports = {
	"server": {"port": 3000},
	"cache": {"time": 1, "dir": './tmp/cache'},
	'log_sql': true,
	'debug': true,
	"data_sources": {
		"sqlite": {
			driver: 'sqlite3', 
			host: "localhost", 
			user: "cakenode_us", 
			password: "cakenode_67", 
			database: ROOT + "/apinode.bd",
			transaction: true,
			dateFormat: "strftime('%d/%m/%Y', {field})",
			dateTimeFormat: "strftime('%d/%m/%Y %H:%M:%S', {field})"
		},
		"default": {
			driver: 'mysql', 
			host: "localhost", 
			user: "cakenode_us", 
			password: "cakenode_67", 
			database: "cakenode_bd",
			transaction: true,
			mask: true,
			dateFormat: "DATE_FORMAT({field}, '%d/%m/%Y')",
			dateTimeFormat: "DATE_FORMAT({field}, '%d/%m/%Y %H:%i:%s')"
		}
	}
}