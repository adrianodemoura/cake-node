/**
 * Rota novo_token
 * 
 * @author      Adriano Moura
 * @package     app.mac.Rotas
 */
'use strict'
/**
 * Retorna um novo token para o cliente. A validação é feita pelo e-mail e senha do cliente.
 */
module.exports = app => {
    /**
     * Tela inicial do mac
     * 
     * @access  {Public}
     * @param   {String}    email*      e-mail do usuário
     * @param   {String}    senha*      senha do usuário
     * @param   {Boolean}   doc         Se existente retorna a documentação da página.
     * @return  {Object}    retorno     Status da operação.
     */
    app.get('/mac/novo_token', async (req, res) => {
        const retorno = {}

        try {
            const clienteEmail = (!!app.settings.params.email) ? app.settings.params.email : ''
            const clienteSenha = (!!app.settings.params.senha) ? app.settings.params.senha : ''

            if (!!!clienteEmail) {
                throw new Error(__('O parâmetro %email% não foi informado!'))
            }
            if (!!!clienteSenha) {
                throw new Error(__('O parâmetro %senha% não foi informado!'))
            }

            // recuperando o usu[ario pelo e-mail
            const Usuario = await getTable('mac.usuarios')
            if (!!!Usuario) {
                throw new Error(__('Não foi possível inicializar %usuario%'))
            }
            Usuario.schema['senha'].hidden = false

            let paramsUser      = {}
            paramsUser.type     = 'first'
            paramsUser.fields   = ['id', 'email', 'senha']
            paramsUser.where    = {email: clienteEmail}
            const dataUsuario   = await Usuario.find(paramsUser)
            if (!!!dataUsuario) {
                throw new Error(__('Não foi possível recuperar os dados do cadasro %Usuário%!'))
            }
            if (dataUsuario.itens[0].UsuaSenha !== geraSenha(clienteSenha)) {
                throw new Error(__('%senha% inválida!'))
            }
            const novoToken = geraToken()
            const clienteId = dataUsuario.itens[0].UsuaId

            if (! await Usuario.updateAll({token: novoToken}, {id: clienteId})) {
                gravaLog(Usuario.error, 'error_ao_gerar_novo_token')
                throw new Error(__('Ocorreu um erro ao tentar gerar novo token!'))
            }

            // auditando
            global.USUARIO = {id: clienteId}
            gravaAuditoria('Usuário '+clienteEmail+' gerou um novo token.', 'token noto_token')

            retorno.status  = true
            retorno.msg     = __('Novo token gerado com sucesso.')
            retorno.token   = novoToken
        } catch (error) {
            retorno.status  = false
            retorno.msg     = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc     = await requireLib('doc')(MODULES + '/mac/rotas/novo_token.js')
        }
        res.send(retorno)
    })
}