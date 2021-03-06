/**
 * Table Perfis
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro perfis.
 */
const Table = require (CORE + '/orm/table.js')
class Perfis extends Table {
    /**
     * Inicialização
     */
    init() {
        this.table      = 'perfis'
        this.schemaName = 'perfil'

        this.associations = {
            hasOne: {
                Aplicacao: {
                    module:                 'mac',
                    foreignKeyLeft:         'aplicacao_id',
                    tableRight:             'aplicacoes',
                    foreignKeyRight:        'id'
                }
            },
            hasMany: {
                Rotas: {
                    module:                 'mac',
                    foreignKeyLeft:         'id',
                    tableBridge:            'permissoes',
                    foreignKeyBridgeLeft:   'perfil_id', 
                    foreignKeyBridgeRight:  'rota_id',
                    tableRight:             'rotas',
                    foreignKeyRight:        'id'
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create'], msg: __('O Campo nome é obrigatório !')},
                unique: {msg: __("O nome '{nome}' já foi cadastrado !")}
            },
            'aplicacao_id': {
                notEmpty: {when: ['create'], 'msg': __('O campo %aplicacao_id% é obrigatório!')}
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
        this.data['PerfAplicacaoId'] = configure('codigo_sistema')

        return true
    }
}

module.exports = new Perfis()
