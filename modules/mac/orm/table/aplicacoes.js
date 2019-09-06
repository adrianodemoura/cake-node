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
                    tableRight:             'rotas',
                    foreignKeyRight:        'aplicacao_id'
                }
            },
            Perfis: {
                hasMany: {
                    foreignKeyLeft:         'id',
                    tableRight:             'perfis',
                    foreignKeyRight:        'aplicacao_id'
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
