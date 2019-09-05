/**
 * Autenticacao
 * 
 * Valida o token informado pelo lado do cliente com o token da aplicação.
 *
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Executa a autenticação no usuário pelo token.
 */
module.exports = async function(params) {
    let retorno = {}

    try {
        // recuperando o token
        const token = !!!params.token ? '' : params.token
        if (!token.length) {
            throw new Error(__('Token ausente!'))
        }

        // validando o token
        const Usuarios       = await getTable('mac.usuarios')
        if (!Usuarios) {
            throw new Error(__('Não foi possível inicializar %Usuarios%')+'. '+__('Certifique-se que a instalação inicial foi executada.'))
        }
        const dataUsuario   = await Usuarios.find({
            fieldHidden: true, 
            type: 'first', 
            fields: ['usua.id', 'usua.nome', 'usua.email', 'usua.ativo', 'usua.ultimo_acesso', 'usua.acessos'],
            where: {'token':token}
        })
        if (!!!dataUsuario) {
            throw new Error(__('%Token% inválido!'))
        }
        if (!dataUsuario.UsuaAtivo) {
            throw new Error(__('Usuário %'+dataUsuario.UsuaEmail+'% desativado !'))
        }

        // configurando a diferença com o último acesso
        let ultimoAcesso    = dataUsuario.UsuaUltimoAcesso
        let ultimoTime      = new Date(ultimoAcesso).getTime()
        let acessos         = (dataUsuario.UsuaAcessos+1)
        let agora           = maskSql(new Date())
        let agoraTime       = new Date(agora).getTime()
        let diffAcesso      = (agoraTime - ultimoTime)/1000 // diferença com o último acesso em segundos.

        // atualizando acesso do usuário autenticado
        let fields          = {UsuaAcessos: acessos, UsuaUltimoAcesso: agora}
        let where           = {UsuaId: dataUsuario.UsuaId}
        if (! await Usuarios.updateAll(fields, where)) {
            throw new Error(Usuarios.error)
        }

        // atualizando o global com os dados do usuário
        global.USUARIO = {
            id: dataUsuario.UsuaId, 
            nome: dataUsuario.UsuaNome, 
            email: dataUsuario.UsuaEmail, 
            cpf: dataUsuario.UsuaCpf,
            diff_acesso: diffAcesso+' (s)'
        }

        retorno.status  = true;
        retorno.msg     = __('Token válidado com sucesso.')
    } catch (error) {
        retorno = {}
        retorno.status  = false
        retorno.msg     = error.message
        gravaLog(error.message, 'erros_token')
    }

    return retorno
}