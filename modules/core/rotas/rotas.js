/**
 * Rota rotas
 * 
 * @author      Adriano Moura
 * @package     app.Rotas
 */
'use strict'
/**
 * Retorna o resumo das rotas da aplicação.
 */
module.exports = app => {
    /**
     * Retorna ajuda do aplicativo.
     * 
     * @access  {Authenticated}
     * @param   {Boolean}   doc     Se existente retorna a documentação da página.
     * @return  {String}    status  Status da operação
     * @return  {String}    msg     Mensagem da operação
     * @return  {Object}    rotas   Descrição de cada rota da API
     */
    app.get('/rotas', async (req, res) => {
        
        const retorno   = {}
        const rotas     = {}
        const ignorar   = ['empty']
        const fs        = require('fs')

        // rotas dos plugins
        fs.readdirSync(MODULES).forEach(module => {
            if (fs.existsSync(MODULES+'/'+module+'/rotas/')) {
                fs.readdirSync(MODULES + '/' + module + '/rotas/').forEach(file => {
                    let rota = file.replace('.js', '')
                    if (ignorar.indexOf(rota) === -1) {
                        if (module === 'core') {
                            let method = readMethod(MODULES+'/'+module+'/rotas/'+file, fs)
                            rotas[rota+' ('+method+')'] = readDescription(MODULES+'/'+module+'/rotas/'+file, fs)
                        } else {
                            let method = readMethod(MODULES+'/'+module+'/rotas/'+file, fs)
                            rotas[module+'/'+rota+' ('+method+')'] = readDescription(MODULES+'/'+module+'/rotas/'+file, fs)
                        }
                    }
                })
            }
        })

        retorno.status  = true
        retorno.msg     = 'Rotas de ' + configure('SISTEMA')
        retorno.rotas   = rotas

        res.removeHeader('X-Powered-By')
        res.send(retorno)
    })

    /**
     * Retorna o método de uma roda
     *
     * @param   {String}    file    Nome do arquivo .js
     * @param   {Object}    fs      Objeto file_sistema
     * @return  {String}    method  Nome do método, get ou post.
     */
    const readMethod = function(file='', fs=null) {
        let rota        = file.replace('.js', '')
        let method      = ''
        let conteudo    = fs.readFileSync(file).toString()

        if (conteudo.indexOf('app.post(')>-1) {
            method = 'post'
        }
        if (conteudo.indexOf('app.get(')>-1) {
            method = 'get'
        }

        return method.trim()
    }

    /**
     * Retorna a descrição de um arquivo, conforme a regulamentação 2.12.4
     *
     * @param   {String}    file    Caminho completo e nome do arquivo
     * @param   {Object}    fs      Objeto file_system
     * @return  {String}    desc    Descrição do arquivo
     */
    const readDescription = function(file='', fs=null) {
        let rota        = file.replace('.js', '')
        let desc        = ''
        let loop        = 0
        let podePegar   = false

        let conteudo = fs.readFileSync(file).toString()
        conteudo.split(/\r?\n/).forEach(function(line) {
            if (line.indexOf('*/')>-1) {
                podePegar = false
                return
            }
            if (podePegar) {
                desc += line.replace(/\*/g,'').trim()+' '
            }
            if (line.indexOf('/**')>-1) {
                loop++
                if (loop==2) {
                    podePegar = true
                }
            }
        })

        return desc
    }
}