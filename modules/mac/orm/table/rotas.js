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
            Aplicacoes: {
                hasOne: {
                    table:                  'mac.aplicacoes', 
                    foreignKeyLeft:         'aplicacao_id',
                }
            },
            Perfis: {
                hasMany: {
                    table:                  'mac.perfis',  
                    tableBridge:            'perfis_rotas', 
                    foreignKeyBridgeLeft:   'rota_id', 
                    foreignKeyBridgeRight:  'perfil_id'
                    /*aliasRight:             'PerfRota'*/
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
}

module.exports = new Rotas()
