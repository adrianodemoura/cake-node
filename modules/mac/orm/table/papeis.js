/**
 * Table Papeis
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro Papeis.
 */
const Table = require (CORE + '/orm/table.js')
class Papeis extends Table {
    /**
     * Inicialização
     */
    init() {
        this.table      = 'papeis'
        this.schemaName = 'papel'

        this.associations = {
            hasMany: {
                Usuarios: {
                    module:                 'mac',
                    foreignKeyLeft:         'usuario_id',
                    tableRight:             'usuarios',
                    foreignKeyRight:        'id',
                    fields:                 ['id', 'nome', 'email', 'acessos']
                },
                Perfis: {
                    module:                 'mac',
                    foreignKeyLeft:         'perfil_id',
                    tableRight:             'perfis',
                    foreignKeyRight:        'id'
                },
                Unidades: {
                    module:                 'mac',
                    foreignKeyLeft:         'unidade_id',
                    tableRight:             'unidades',
                    foreignKeyRight:        'id'
                },
                Aplicacoes: {
                    module:                 'mac',
                    foreignKeyLeft:         'aplicacao_id',
                    tableRight:             'aplicacoes',
                    foreignKeyRight:        'id'
                }
            }
        }
    }

    /**
     * Método antes de validar
     * - força o id da aplicação.
     *
     * @param   {Object}    data        Dados do registro.
     * @return  {Boolean}   boolean     Verdadeiro se deve continuar, Falso se não.
     */
    async beforeValidate() {
        this.data['PapeAplicacaoId'] = configure('codigo_sistema')

        return true
    }

    /**
     * Método antes de salvar
     * - verifica duplicidade.
     *
     * @param   {Object}    data    Dados do registro.
     * @return  {Boolean}   boolean     Verdadeiro se deve continuar, Falso se não.
     */
    async beforeSave() {
        const idUsuario     = this.data['PapeUsuarioId']
        const idUnidade     = this.data['PapeUnidadeId']
        const idPerfil      = this.data['PapePerfilId']
        const idAplicacao   = this.data['PapeAplicacaoId']

        if (await this.verDupliciade(idUsuario, idUnidade, idPerfil, idAplicacao)) {
            this.error = __('Este papel já foi cadastratado!')
            return false
        }

        return true
    }

    /**
     * Verifica a duplicidade do papel.
     *
     * @param   {Integer}   idUsuario   id do usuário
     * @param   {Integer}   idUnidade   id da unidade
     * @param   {Integer}   idPerfil    id do perfil
     * @return  {Boolean}   boolean     Verdadeiro se encontrou duplicidade, Falso se não.
     */
    async verDupliciade(idUsuario=0, idUnidade=0, idPerfil=0, idAplicacao=0) {

        let params                  = {}
        params.type                 = 'count'
        params.where                = {}
        params.where['usuario_id']  = idUsuario
        params.where['unidade_id']  = idUnidade
        params.where['perfil_id']   = idPerfil

        const totalDuplicidade = await this.find(params)

        return (totalDuplicidade>0) ? true : false
    }
}

module.exports = new Papeis()
