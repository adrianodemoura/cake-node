/**
 * Function ReadDoc
 * 
 * Executa a leitura da documentação de um arquivo fonte (.js)
 *
 * @author      Adriano Moura
 * @package     core.Lib
 */
'use strict'
/**
 * @access  {Public}
 * @param   {String}    file        Nome do arquivo a ser lido.
 * @return  {Object}    doc         Dados da documentação
 */
module.exports = async function(file='') {
    let doc         = {}
    let acesso      = ''
    let arrParams   = []
    let arrReturns  = []

    require('fs').readFileSync(file, 'utf-8').split(/\r?\n/).forEach(function (line) {

        // parâmetros
        if (line.indexOf('@param') > -1) {
            let linha = line.replace(/\* /g,'').replace(/@param/g,'').replace(/[{}]/g,'').trim()
            if (linha.length > 0) {
                let param = {name:'', required: false, type: '', description: ''}

                for (let i = 0; i < linha.length; i++) {
                    if (linha.substr(i, 1) === ' ') {
                        if (param.type === '') {
                            param.type = linha.substr(0, i)
                        } else if (param.name === '') {
                            param.name = linha.substring(i, linha.indexOf(' ')).trim()
                            if (param.name.length) {
                                let pos1 = line.indexOf(param.name+'*')
                                let pos2 = line.indexOf('*'+param.name)
                                if (pos1>-1 || pos2>-1) {
                                    param.required = true
                                    param.name = param.name.replace('*','')
                                }
                            }
                        }
                        if (!!param.name && param.description==='') {
                            param.description = linha.substring(i, linha.length).trim()
                            break
                        }
                    }
                }
                arrParams.push(param)

            }
        }

        // retornos
        if (line.indexOf('@return') > -1) {
            let linha = line.replace(/\* /g, '').replace(/@return/g, '').replace(/[{}]/g, '').trim()
            if (linha.length>0) {
                let retorno = {name:'', type: '', description: ''}

                for(let i=0; i<linha.length; i++) {
                    if (linha.substr(i, 1) === ' ') {
                        if (retorno.type === '') {
                            retorno.type = linha.substr(0, i)
                        } else if (retorno.name === '') {
                            retorno.name = linha.substring(i,linha.indexOf(' ')).trim()
                        }
                        if (!!retorno.name && retorno.description === '') {
                            retorno.description = linha.substring(i, linha.length).trim()
                            break
                        }
                    }
                }
                arrReturns.push(retorno)

            }
        }

        // acessos
        if (line.indexOf('@access') > -1) {
            acesso = line.replace(/\* /g, '').replace(/@access/g, '').replace(/[{}]/g, '').trim()
        }

        // se está na linha app.[get|post|delete|etc]
        if (line.indexOf('app.')>-1 && line.indexOf(',') > -1) {
            let aspas = (line.indexOf('"')>-1) ? '"' : "'"
            try {
                let rota = line.substring(line.indexOf(aspas) + 1, line.lastIndexOf(aspas))
                doc[rota] = {access: acesso, 
                    method: line.substring(line.indexOf(".") + 1, line.indexOf("(")), 
                    params: arrParams,
                    return: arrReturns}
                acesso  = ''

            } catch (error) {
                gravaLog(error.message, 'error_global')
                console.log(error.message)
            }
        }
    })

    return doc
}