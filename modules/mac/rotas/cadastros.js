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
     * Tela inicial do mac
     * 
     * @access  {Authenticated}
     * @return  {Object}    retorno     Status da operação, incluindo a lista de cadastros.
     */
    app.get('/mac/cadastros', async (req, res) => {
        const retorno = {}

        try {

            // retornando
            retorno.status      = true
            retorno.msg         = __('Rota %mac/cadastros% consumida com sucesso.')
            retorno.cadastros   = [
                'mac.aplicacoes', 
                'mac.auditorias',
                'mac.municipios', 
                'mac.perfis', 
                'mac.rotas',
                'mac.unidades', 
                'mac.usuarios', 
            ]
        } catch (error) {
            retorno.status  = false
            retorno.msg     = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc = await requireLib('doc')(MODULES + '/mac/rotas/cadastros.js')
        }
        res.send(retorno)
    })
}