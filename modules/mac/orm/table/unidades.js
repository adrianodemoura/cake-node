/**
 * Table Unidades
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro de unidades.
 */
const Table = require (CORE + '/orm/table.js')
class Unidades extends Table {
    /**
     * Inicialização da Unidade
     *
     */
    init () {
        this.table      = 'unidades'
        this.schemaName = 'unidade'

        this.associations = {
            Aplicacoes: {
                hasMany: {
                    foreignKeyLeft: 'id',
                    tableRight: 'aplicacoes',
                    foreignKeyRight: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'unidade_id', 
                    foreignKeyBridgeRight: 'aplicacao_id'
                }
            },
            Perfis: {
                hasMany: { 
                    foreignKeyLeft: 'id',
                    tableRight: 'perfis',
                    foreignKeyRight: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'unidade_id', 
                    foreignKeyBridgeRight: 'perfil_id'
                }
            },
            Usuarios: {
                hasMany: { 
                    foreignKeyLeft: 'id',
                    tableRight: 'usuarios',
                    foreignKeyRight: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'unidade_id', 
                    foreignKeyBridgeRight: 'usuario_id'
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create','update'], msg: __('O Campo nome é obrigatório !')},
                unique: {msg: __("O nome '{nome}' já foi cadastrado !")}
            }
        }

    }
}

module.exports = new Unidades()
