/**
 * Funções globais da aplicação.
 */
'use strict'

/**
 * Retorna a configuração global da aplicação.
 *
 * @param   {String}    tag     Nome da variável
 * @return  {Mixed}     vlr     Valor da variável
 */
global.configure = function(tag='') {
    tag             = tag.toLowerCase()
    const config    = require (ROOT + '/config/config')
    let vlr         = config[tag] || false

    if (! vlr ) {
        const configAmbiente = require (ROOT + '/config/config_' + process.env['NODE_ENV'])
        vlr = configAmbiente[tag] || false
    }

    if (! vlr ) {
        const configCore = require (CORE + '/config/config')
        vlr = configCore[tag] || false
    }

    return vlr
}

/**
 * Retorna o trace do error
 *
 * @param   {String}    error   Instância erro herdada do try catch.
 * @return  {Object}    trace   Trace contendo arquivo, linha e coluna.
 */
global.getTrace = function(error='') {
    let trace = undefined
    if (configure('debug')) {
        trace = error.stack.match(/(?<=\().*(?=\))/g).map(line => line.replace(ROOT,''))
    }

    return trace
}

/**
 * Retorna o value no formato brasileiro.
 *
 * @param   {Mixed}     value   Objeto a ser formatado, Numeric (1234.56) ou Date (new date())
 * @return  {String}    mask    Valor no formato pt-BR
 */
global.maskBr = function(value) {
    let constructor = value.constructor.name.toLowerCase()
    let mask        = value

    switch(constructor) {
        case 'number':
            let digitos = (value.toString().length - value.toString().lastIndexOf('.') + 1)
            mask = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: digitos})
                .format(value).replace(/,/g, '.')
                .replace(/.([0-9]{2,}$)/, ',$1')
            break
        case 'date':
            mask = ("0" + value.getDate()).slice(-2)
                + "-" + ("0" +(value.getMonth()+1)).slice(-2)
                + "-" + value.getFullYear()
                + " " + ("0" + value.getHours()).slice(-2)
                + ":" + ("0" + value.getMinutes()).slice(-2)
                + ":" + ("0" + value.getSeconds()).slice(-2)
            break
    }

    return mask
}

/**
 * Retorna o value no formato brasileiro.
 *
 * @param   {String}    value   Valor a ser re-formatado
 * @return  {String}    mask    Valor no formato inglês
 */
global.maskSql = function(value='') {
    let constructor = value.constructor.name.toLowerCase()
    let mask        = value

    switch(constructor) {
        case 'number':
            mask = value.toString().replace(/\./g, '').replace(/\,/g,'.')
            break

        case 'date':
            mask = value.getFullYear()
                + "-" + ("0" +(value.getMonth()+1)).slice(-2)
                + "-" + ("0" + value.getDate()).slice(-2)
                + " " + ("0" + value.getHours()).slice(-2)
                + ":" + ("0" + value.getMinutes()).slice(-2)
                + ":" + ("0" + value.getSeconds()).slice(-2)
            break
        case 'string':
            let separador   = (value.indexOf('-') > -1) ? '-' : '/'
            let arrValue    = value.split(separador)
            if (arrValue[2] > 2) {
                mask = arrValue[2] + separador + arrValue[1] + separador + arrValue[0]
            }
            break;
    }

    return mask
}

/**
 * Criar um arquivo de log.
 * 
 * @param   {String}    conteudo
 * @param   {String}    arq
 * @public
 */
global.gravaLog = function(conteudo, arq) {
    let fs = require('fs')
    let ar = LOG + '/'+arq+'.log'
    let tx = new Date().toLocaleString()
    tx += " " + MEU_IP.replace('::ffff:','')
    tx += " " + ROTA

    if (typeof conteudo === 'object') {
        tx += " " + JSON.stringify(conteudo, null, 2)
    } else {
        tx += " " + conteudo
    }
    tx += "\n"

    fs.appendFile(ar, tx, (err) => {
        if (err) {
            return console.log(err);
        }
    })
}

/**
 * Retorna um token randômico.
 * 
 * @param   {String}    stringBase
 * @param   {Integer}   byteLength
 * @public
 */
global.geraToken = function ({ byteLength = 64 } = {}) {
    return require('crypto').randomBytes(byteLength).toString('hex')
}

/**
 * Retorna um token randômico.
 * 
 * @param   {String}    stringBase
 * @param   {Integer}   byteLength
 * @public
 */
global.geraSenha = function (senha='') {
    const crypto    = require('crypto')
    const hash     = crypto.createHmac('sha512', configure('SALT'))
    hash.update(senha);
    let password = hash.digest('hex');

    return password
}

/**
 * Cria um registro de auditoria
 * *
 * @param   {String}    texto   Descrição da auditoria
 * @param   {String}    tags    Tagas da auditoria
 */
global.gravaAuditoria = async function(texto='', tags='') {
    const Auditoria = await getTable('mac.auditoria')
    Auditoria.auditar(texto, tags)
}

/**
 * Retorna um string em formato Json
 * 
 * @param   {String}    string      Texto a ser convertido
 * @return  {Json}      novoJson    Object Json
 * @public
 */
global.getStringToJson = function(string='') {
    let divisor         = (string.indexOf(';')>-1) ? ';' : ','
    const arrFiltros    = string.split(divisor)
    let novoJson        = {}
    let separador       = ':'
    let loop            = 1

    for (let i = 0; i < arrFiltros.length; i++) {
        let value   = arrFiltros[i]
        separador   = (value.indexOf('=') > -1) ? '=' : ':'
        let arrField = arrFiltros[i].split(separador)

        if (('0123456789').indexOf( arrField[1].substr(0,1)) > -1 ) {
            arrField[1] = parseInt(arrField[1])
        } else {
            arrField[1] = arrField[1].trim()
        }

        novoJson[arrField[0].trim()] = arrField[1]
    }

    return novoJson
}

/**
 * Retorna um string em formato Json
 * 
 * @param   {String}    string      Texto a ser convertido
 * @return  {Json}      novoJson    Object Json
 * @public
 */
global.getStringToSql = function(string='') {
    let divisor         = (string.indexOf(';')>-1) ? ';' : ','
    const arrFiltros    = string.split(divisor)
    let novoJson        = {}
    let separador       = ':'
    let loop            = 1

    for (let i = 0; i < arrFiltros.length; i++) {
        let value   = arrFiltros[i]
        separador   = (value.indexOf('=')) ? '=' : ':'
        let arrField = arrFiltros[i].split(separador)

        if (('0123456789').indexOf(arrField[1])>-1) {
            arrField[1] = parseInt(arrField[1])
        }

        novoJson[arrField[0].trim()] = arrField[1].trim()
    }

    return novoJson
}

/**
 * Retorna a instância da Lib desejada
 * 
 * @param   {String}    lib     Nome da biblioteca
 * @return  {Object}    object  Instâcia da biblioteca
 * @public
 */
global.requireLib = function(lib='') {
    let objLib = false

    try {
        objLib = require(CORE + '/lib/'+lib.toLowerCase())
    } catch (error) {
        try {
            let arrLib = lib.split('.')
            if (!!!arrLib[1]) {
                gravaLog(__('Nome da lib errado !'), 'error_lib')
            }
            objLib = require(MODULES + '/' + arrLib[0].toLowerCase() + '/lib/' + arrLib[1].toLowerCase())
        } catch (error) {
            gravaLog('Não foi possível carregar a biblioteca '+lib+ ' '+error.message, 'error_lib')
        }
    }

    return objLib
}

/**
 * Retorna a Table desejada
 * 
 * @param   {String}            table       Nome da table
 * @return  {Object|String}     boolean     Instância da Table se localizado em app/orm ou core/orm ou ainda module/orm. Texto em caso negativo.
 * @public
 */
global.getTable = async function(table='') {
    let objTable = false

    try {
        let arrTable = table.split('.')
        if (!!!arrTable[1]) {
            gravaLog('Nome da table errada !', 'error_table')
        }

        const arqTable  = MODULES + '/' + arrTable[0].toLowerCase() + '/orm/table/' + arrTable[1].toLowerCase()
        objTable        = require(arqTable)
        objTable.module = arrTable[0]
        objTable.debug  = configure('debug')
        await objTable.setSchema()
        objTable.clean()
    } catch (error) {
        console.log(error.message)
        gravaLog('Não foi possível carregar a table '+table+ ' '+error.message, 'error_table')
        return false
    }

    return objTable
}

/**
 * retorna a string conforme o idioma
 *
 * @param   {String}    string  Texto a ser traduzido.
 */
global.__ = function(string='', locale='') {
    
    locale = configure('language')
    let string2 = string

    try {
        string2 = !!!LOCALES[locale][string] ? string : LOCALES[locale][string] 

        if (string.indexOf('%') > -1) {
            const arr1      = string.split(' ')
            const arr2      = []
            let var2        = string
            let word        = ''

            arr1.filter((word) => {
                if (word.substr(0,1) === '%' && word.substr(-1) === '%' ) {
                    let w = word.replace(/%/g,'')
                    var2 = var2.replace(w+'%','')
                    arr2.push(w)
                }
            })

            string2 = !!!LOCALES[locale][var2] ? string.replace(/%/g,'') : LOCALES[locale][var2]

            for (let i in arr2) {
                string2 = string2.replace('%', arr2[i])
            }
        }
    } catch (error) {
        string2 = string.replace(/%/g,'')
    }

    return string2
}

/**
 * Configura a variável global LOCALE, com as traduções dó módulo desejado.
 *
 * @param   {String}    module       Nóme do módulo
 */
global.setLocale = function(nameModule='') {
    const fs        = require('fs')
    let languages   = []
    let dir         = MODULES + '/' + nameModule + '/locale/'

    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(arq => {
          languages.push(arq.replace('.js',''))
        })

        for (let i in languages) {
            let sigla = languages[i]
            let file  = dir + '/' + sigla

            if (fs.existsSync(file+'.js')) {
                if (typeof LOCALES[sigla] !== 'undefined') {
                    LOCALES[sigla] = Object.assign(require(file), LOCALES[sigla])
                } else {
                    LOCALES[sigla] = require(file)
                }
            }
        }
    }
}

/**
 * Retorna um array sorteado de um array.
 *
 * @param   {Array}     arr     Array a ser filtrado.
 * @param   {Array}     array   Array filtrado.
 */
global.sortear = function(arr=[], range=0) {
    return arr.sort(range => `0.${range}` - Math.random()).slice(0,range)
}

global.objectClone = function(object={}) {
    return JSON.parse(JSON.stringify(object))
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.fourAlias = function() {
    let string  = this.replace(/([A-Z])/g, ' $1')
    let arr     = string.split(' ')
    let alias   = ''
    for (let i in arr) {
        if (arr[i]) {
            alias += arr[i].substr(0,4)
        }
    }
    return alias
}

String.prototype.undoAlias = function() {
    let undo = this.replace(/([A-Z])/g, ' $1').trim().replace(' ','.').replace(' ','_')
    return undo
}

String.prototype.humanize = function() {
    return this.replace(/(^|_)(\w)/g, function ($0, $1, $2) { return ($1 && '') + $2.toUpperCase() })
}

String.prototype.replaceAll = String.prototype.replaceAll || function(needle, replacement) {
    return this.split(needle).join(replacement);
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}