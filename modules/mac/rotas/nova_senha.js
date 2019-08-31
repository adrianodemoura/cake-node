/**
 * Rota nova_senha
 * 
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Executa a alteração da senha do cliente. A validação é executada pelo toke e email.
 */
module.exports = app => {
    /**
     * Tela inicial do mac
     * 
     * @access  {Public}
     * @param   {String}    token*      Token do cliente
     * @param   {String}    email*      e-mail do cliente
     * @param   {String}    senha*      Nova senha do cliente
     * @param   {Boolean}   doc         Se existente retorna a documentação da página.
     * @return  {Object}    retorno     Status da operação.
     */
    app.get('/mac/nova_senha', async (req, res) => {
        const retorno = {}

        try {
            const clienteEmail = (!!app.settings.params.email) ? app.settings.params.email : ''
            const clienteSenha = (!!app.settings.params.senha) ? app.settings.params.senha : ''
            const clienteToken = (!!app.settings.params.token) ? app.settings.params.token : ''

            if (!!!clienteEmail) {
                throw new Error(__('O parâmetro %email% não foi informado!'))
            }
            if (!!!clienteSenha) {
                throw new Error(__('O parâmetro %senha% não foi informado!'))
            }
            if (!!!clienteToken) {
                throw new Error(__('O parâmetro %token% não foi informado!'))
            }

            // recuperando o usu[ario pelo e-mail
            const Usuario = await getTable('mac.Usuario')
            if (!!!Usuario) {
                throw new Error(__('Não foi possível inicializar %usuario%'))
            }
            Usuario.schema['token'].hidden = false

            let paramsUser      = {}
            paramsUser.type     = 'first'
            paramsUser.fields   = ['id', 'email', 'senha', 'token']
            paramsUser.where    = {email: clienteEmail}
            const dataUsuario   = await Usuario.find(paramsUser)
            if (!!!dataUsuario) {
                throw new Error(__('%e-mail% inválido!'))
            }
            if (dataUsuario.itens[0].UsuaToken !== clienteToken) {
                throw new Error(__('%token% inválido!'))
            }
            const novaSenha = geraSenha(clienteSenha)
            const clienteId = dataUsuario.itens[0].UsuaId

            if (! await Usuario.updateAll({senha: novaSenha}, {id: clienteId})) {
                gravaLog(Usuario.error, 'error_ao_gerar_nova_senha')
                throw new Error(__('Ocorreu um erro ao tentar gerar nova senha!'))
            }

            // auditando
            global.USUARIO = {id: clienteId}
            gravaAuditoria('Usuário '+clienteEmail+' gerou uma nova senha.', 'senha nova_senha')

            retorno.status  = true
            retorno.msg     = __('Nova senha gerada com sucesso.')
            retorno.nova_senha = clienteSenha
        } catch (error) {
            retorno.status  = false
            retorno.msg     = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc     = await requireLib('doc')(MODULES + '/mac/rotas/nova_senha.js')
        }
        res.send(retorno)
    })
}