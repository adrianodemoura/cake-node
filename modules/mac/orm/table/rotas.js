/**
 * Table Rotas
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro de rotas.
 */
const Table = require (CORE + '/orm/table.js')
class Rotas extends Table {
    /**
     * Inicialização
     */
    init() {
        this.table      = 'rotas'
        this.schemaName = 'rota'

        this.associations = {
            hasOne: {
                Aplicacoes: {
                    foreignKeyLeft: 'aplicacao_id',
                    tableRight: 'aplicacoes',
                    foreignKeyRight: 'id'
                }
            },
            hasMany: {
                Perfis: {
                    foreignKeyLeft: 'id',
                    tableBridge: 'permissoes', 
                    foreignKeyBridgeLeft: 'rota_id', 
                    foreignKeyBridgeRight: 'perfil_id',
                    tableRight: 'perfis',
                    foreignKeyRight: 'id'
                }
            },
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create','update'], msg: __('O Campo nome é obrigatório !')},
                unique: {msg: __("A Rota '{nome}' já foi cadastrada!")}
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
        this.data['RotaAplicacaoId'] = configure('codigo_sistema')

        return true
    }
}

module.exports = new Rotas()
