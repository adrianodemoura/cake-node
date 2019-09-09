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
                    foreignKeyRight:        'id'
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
}

module.exports = new Papeis()
