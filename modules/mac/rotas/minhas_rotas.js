/**
 * Rota mac/minhas_rotas
 * 
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Retorna a lista de rotas do usuário
 */
module.exports = app => {
    /**
     * Rota inicial do mac
     * 
     * @access  {Authenticated}
     * @return  {Object}    retorno     Status da operação.
     */
    app.get('/mac/minhas_rotas', async (req, res) => {
        const retorno = {}

        try {
            const clienteToken = (!!app.settings.params.token) ? app.settings.params.token : ''           
            if (!!!clienteToken) {
                throw new Error(__('O parâmetro %token% não foi informado!'))
            }

            const Usuario = await getTable('mac.usuarios')
            if (!!!Usuario) {
                throw new Error(__('Não foi possível inicializar %usuario%'))
            }

            let paramsUser      = {}
            paramsUser.type     = 'first'
            paramsUser.where    = {token: clienteToken}
            paramsUser.associations = ['Municipio', 'Perfis', 'Unidades']
            const dataUsuario   = await Usuario.find(paramsUser)
            if (!!!dataUsuario) {
                throw new Error(__('%usuário% inválido!'))
            }

            // retornando
            retorno.status      = true
            retorno.msg         = __('Minhas rotas recuperadas com sucesso.')
            retorno.rotas       = await Usuario.getMinhasRotas(dataUsuario.UsuaId)
        } catch (error) {
            retorno.status      = false
            retorno.msg         = error.message
            retorno.trace       = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc     = await requireLib('doc')(MODULES + '/mac/rotas/minhas_rotas.js')
        }

        res.send(retorno)
    })
}