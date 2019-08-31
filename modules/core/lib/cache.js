/**
 * Class Cache
 *
 * @author 		Adriano Moura
 * @package 	app.Core.Lib
 */
'use strict'
/**
 * Mantém o cache da aplicação.
 */
class Cache {
	/**
	 * Método start
	 */
	constructor() {
		const CACHE = configure('cache')
		this.dirCache = CACHE.dir
		this.timeCache= CACHE.time
	}

	/**
	 * Execta a limpeza do cache
	 */
	clean () {
		try {
			let fs = require('fs')
			let notDel = ['empty', 'vazio']
		
			fs.readdir(this.dirCache, (err, files) => {
				if (err) throw new Error(err)
				for (let file of files) {
					if (notDel.indexOf(file) < 0) {
						fs.unlinkSync(this.dirCache + '/' + file)
					}
				}
			})
		} catch (error) {
			console.log(error.message)
			gravaLog(error.message, 'error')
		}
	}

	/**
	 * Executa a escrita de um arquivo em cache.
	 *
	 * @param 	{Object} 	contentCache 	Conteúdo a ser cacheado.
	 * @param 	{String} 	file 			Nome do arquivo 
	 * @return 	{Void}
	 */
	write (contentCache={}, file={}) {
		let fs 			= require('fs')
		let text 		= ''
		let timeExpire 	= new Date().addDays(this.timeCache).getTime()

	    text 			= {time: timeExpire, content: contentCache}

	    fs.writeFileSync(this.dirCache + '/' + file, JSON.stringify(text))

	    if (configure('debug')) {
	    	console.log(__('escrevi o esquema '+file+' no cache ...'))
	    }
	}

	/**
	 * Executa a escrita de um arquivo em cache.
	 *
	 * @param 	{String} 	file 		Nome do arquivo 
	 * @return 	{Void}
	 */
	read (file='') {
		const fs 	= require('fs')
		const arq 	= this.dirCache + '/' + file

		try {
	    	let rawdata = fs.readFileSync(arq)
		    let now 	= new Date().getTime()
			let data 	= JSON.parse(rawdata)

			if (!!!data.time) {
				throw new Error(__('Arquivo inválido'))
			}
			/*if (configure('debug')) {
				console.log(maskBr(new Date(data.time)))
			}*/

			if (!!!data.content) {
				throw new Error(__('Arquivo inválido'))
			}

			return data.content
		} catch (err) {
			return {}
		}

	}
}

module.exports = new Cache