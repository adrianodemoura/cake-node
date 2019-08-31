/**
 * Rota excluir
 * 
 * @author      Adriano Moura
 * @package     app.Rotas
 */
'use strict'
/**
 * Executa a exclusão de um registro do cadastro do banco de dados.
 */
module.exports = app => {
    /**
     * Executa a exclusão de uma collection.
     * 
     * @access  {Authenticated}
     * @param   {String}        cadastro*       Nome do cadastro, pode ser no formato Plugin.Cadastro
     * @param   {Number}        id*             Id a ser excluído
     * @param   {Boolean}       doc             Se existente retorna a documentação da página.
     * @return  {Object}        retorno         Status da Operação.
     */
    app.get('/excluir', async (req, res) => {
        const retorno   = {}
        let cadastro    = ''

        try {
            cadastro = (!!app.settings.params.cadastro) ? app.settings.params.cadastro : ''
            if (!!!cadastro) {
                throw new Error(__('O parâmetro %cadastro% não foi informado!'))
            }

            const id = (!!app.settings.params.id) ? parseInt(app.settings.params.id) : 0
            if (!!!id) {
                throw new Error(__('O parâmetro %id% não foi informado!'))
            }

            const Table = await getTable(cadastro)
            if (!Table) {
                throw new Error(__('Cadastro %'+cadastro+'% inválido!'))
            }

            if (! await Table.delete(id)) {
                throw new Error(Table.error)
            }

            retorno.status  = true
            retorno.msg     = __('Registro %'+cadastro+'.'+id+'% excluído com sucesso.')
            gravaAuditoria(retorno.msg, 'exclusao_cadastro')
        } catch (error) {
            retorno.status  = false
            retorno.error   = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc = await requireLib('doc')(CORE + '/rotas/excluir.js')
        }
        res.send(retorno)
    })
}