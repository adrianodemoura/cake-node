/**
 * Table Aplicacoes
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro de aplicações.
 */
const Table = require (CORE + '/orm/table.js')
class Aplicacoes extends Table {
    /**
     * Inicialização
     */
    init() {
        this.table      = 'aplicacoes'
        this.schemaName = 'aplicacao'

        // associações
        this.associations = {
            Rotas: {
                hasMany: {
                    foreignKeyLeft:         'id',
                    tableBridge:            'aplicacoes_rotas', 
                    foreignKeyBridgeLeft:   'aplicacao_id', 
                    foreignKeyBridgeRight:  'rota_id',
                    foreignKeyRight:        'id',
                    tableRight:             'rotas'
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {
                    when: ['create','update'],
                    msg: __('O Campo nome é obrigatório !')
                },
                unique: {
                    msg: __("A Aplicação '{nome}' já foi cadastrada!")
                }
            }
        }

    }
}

module.exports = new Aplicacoes()
