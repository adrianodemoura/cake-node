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
            hasMany: {
                Aplicacoes: {
                    module:                 'mac',
                    foreignKeyLeft:         'id',
                    tableRight:             'aplicacoes',
                    foreignKeyRight:        'id',
                    tableBridge:            'papeis',
                    foreignKeyBridgeLeft:   'unidade_id', 
                    foreignKeyBridgeRight:  'aplicacao_id'
                },
                Perfis: { 
                    module:                 'mac',
                    foreignKeyLeft:         'id',
                    tableRight:             'perfis',
                    foreignKeyRight:        'id',
                    tableBridge:            'papeis',
                    foreignKeyBridgeLeft:   'unidade_id', 
                    foreignKeyBridgeRight:  'perfil_id'
                },
                Usuarios: { 
                    module:                 'mac',
                    foreignKeyLeft:         'id',
                    tableRight:             'usuarios',
                    foreignKeyRight:        'id',
                    tableBridge:            'papeis',
                    foreignKeyBridgeLeft:   'unidade_id', 
                    foreignKeyBridgeRight:  'usuario_id'
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
