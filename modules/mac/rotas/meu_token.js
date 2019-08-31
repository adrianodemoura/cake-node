/**
 * Rota mac/meu_token
 * 
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Retorna o token de um cliente. A busca do token é feita pelo email e senha, caso a senha não seja informada o token é enviado para o e-mail do cliente.
 */
module.exports = app => {
    /**
     * Rota para recupera o token do usuário.
     * 
     * @access  {public}
     * @param   {String}    email*      email do cliente.
     * @param   {String}    senha*      senha do cliente.
     * @param   {Boolean}   doc         Se existente retorna a documentação da página.
     * @return  {Object}    retorno     Status da operação, incluido o token no caso de sucesso.
     */
    app.get('/mac/meu_token', async (req, res) => {
        const retorno = {}
        let bancoInstalado = true

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
            const Usuarios = await getTable('mac.usuarios')
            if (!!!Usuarios) {
                bancoInstalado = false
                throw new Error(__('Não foi ppossível inicializar %usuarios%'))
            }
            const totalUsuarios = await Usuarios.count()
            if (!!!totalUsuarios) {
                throw new Error(__("O Módulo mac não foi instalado ainda, acesso a rota '/instalacao' !"))
            }

            Usuarios.schema['token'].hidden = false
            Usuarios.schema['senha'].hidden = false
            let paramsUser      = {}
            paramsUser.type     = 'first'
            paramsUser.fields   = ['id', 'email', 'senha', 'token']
            paramsUser.where    = {email: clienteEmail}
            const dataUsuario   = await Usuarios.find(paramsUser)
            if (!!!dataUsuario) {
                throw new Error(__('%e-mail% inválido!'))
            }
            if (dataUsuario.UsuaSenha !== geraSenha(clienteSenha)) {
                console.log(dataUsuario.UsuaSenha+' '+clienteSenha+' '+geraSenha(clienteSenha))
                throw new Error(__('%senha% inválida!'))
            }

            // auditando
            global.USUARIO = {id: 1}
            gravaAuditoria('Usuário '+clienteEmail+' recuperou seu token.', 'token chave')

            // retornando
            retorno.status  = true
            retorno.msg     = __('Token recuperado com sucesso.')
            retorno.obs     = __("Para alterar o token, acesse '/novo_token', informando 'e-mail' e 'senha' do cliente.")
            retorno.token   = dataUsuario.UsuaToken
        } catch (error) {
            retorno.status  = false
            retorno.msg     = error.message
            if (! bancoInstalado) {
                retorno.obs     = __("Certifique-se que a instalação inicial foi executada!")
            }
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc = await requireLib('doc')(MODULES + '/mac/rotas/meu_token.js')
        }
        res.send(retorno)
    })
}