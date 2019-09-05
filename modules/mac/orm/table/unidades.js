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
                    table: 'mac.aplicacoes', 
                    tableBridge: 'vinculacoes',
                    foreignKeyBridgeLeft: 'unidade_id', 
                    foreignKeyBridgeRight: 'aplicacao_id'
                }
            },
            Perfis: {
                hasMany: { 
                    table: 'mac.perfis', 
                    tableBridge: 'vinculacoes',
                    foreignKeyBridgeLeft: 'unidade_id', 
                    foreignKeyBridgeRight: 'perfil_id'
                }
            },
            Usuarios: {
                hasMany: { 
                    table: 'mac.usuarios', 
                    tableBridge: 'vinculacoes',
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
