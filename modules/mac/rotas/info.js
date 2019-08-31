/**
 * Rota mac/cadastros
 * 
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Retorna a lista de cadastros da API.
 */
module.exports = app => {
    /**
     * Rota inicial do mac
     * 
     * @access  {Authenticated}
     * @return  {Object}    retorno     Status da operação.
     */
    app.get('/mac/info', async (req, res) => {
        const retorno = {}

        try {

            // retornando
            retorno.status      = true
            retorno.msg         = __('Bem vindo.')
        } catch (error) {
            retorno.status      = false
            retorno.msg         = error.message
            retorno.trace       = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc     = await requireLib('doc')(MODULES + '/mac/rotas/info.js')
        }

        res.send(retorno)
    })
}