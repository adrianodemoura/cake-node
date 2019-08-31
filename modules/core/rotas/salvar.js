/**
 * Rota salvar
 * 
 * @author      Adriano Moura
 * @package     app.Rotas
 */
'use strict'
/**
 * Executa a inclusão ou atualização do registro de um cadastro.
 */
module.exports = app => {
    /**
     * Executa o insert ou update de uma collection.
     *
     * @access  {Authenticated}
     * @param   {String}    cadastro*       Nome do cadastro a ser alterado
     * @param   {Boolean}   force_create    Força a inclusão, últil para definir o id.
     * @param   {Boolean}   doc             Se existente retorna a documentação da página.
     * @param   {Array}     data            Matriz com os campos a serem alterados ou inseridos, no formato campo1:valor;campo2:valor sem espaços em branco
     * @return  {Object}    retorno         Status da operação. mensagem de erro ou sucesso.
     */
    app.post('/salvar', async (req, res) => {
        let retorno = {}

        try {
            const naoPodeSalvar = ['mac.municipio', 'mac.auditoria']

            const cadastro = (!!app.settings.params.cadastro) ? app.settings.params.cadastro : ''
            if (!!!cadastro) {
                throw new Error(__('O parâmetro %cadastro% não foi informado!'))
            }
            if (naoPodeSalvar.indexOf(cadastro.toLowerCase())>-1) {
                throw new Error(__('O Cadastro %'+cadastro+'% está bloqueado para atualizações!'))
            }

            const forceCreate = (!!app.settings.params.force_create) ? app.settings.params.force_create : false

            const data = (!!app.settings.params.data) ? app.settings.params.data : ''
            if (!!!data) {
                throw new Error(__('O parâmetro %data% não foi informado!'))
            }
            const id        = (!!data.id) ? parseInt(data.id) : null
            const objData   = getStringToJson(data)
            if (!Object.keys(objData)) {
                throw new Error(__('Parâmetro %data% inválido!'))
            }

            const Table         = await getTable(cadastro)
            Table.forceCreate   = forceCreate
            if (!Table) {
                throw new Error(__('Cadastro %'+cadastro+'% inválido!'))
            }
            const alias = Table.alias

            if (! await Table.save(objData)) {
                throw new Error(Table.error)
            }

            retorno.status  = true
            retorno.msg     = __('Cadastro %' + cadastro + '% atualizado com sucesso.')
        } catch (error) {
            retorno         = {}
            retorno.status  = false
            retorno.error   = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc = await requireLib('doc')(CORE + '/rotas/salvar.js')
        }
        res.removeHeader('X-Powered-By')
        res.send(retorno)
    })
}