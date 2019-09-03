/**
 * Table Papeis
 * 
 * @author      Adriano Moura
 * @package     app.module.orm.table
 */
'use strict'
/**
 * Mantém a tabela de usuários.
 */
const Table = require (CORE + '/orm/table.js')
class Papeis extends Table {
    /**
     * Método de inicialização do Municipio
     */
    init () {
        this.table      = 'papeis'
        this.schemaName = 'papel'

        this.associations = {
            Usuario: {
                hasOne: { table: 'mac.usuarios', foreignKeyLeft: 'usuario_id' }
            },
            Perfil: {
                hasOne: { table: 'mac.perfis', foreignKeyLeft: 'perfil_id' }
            },
            Unidade: {
                hasOne: { table: 'mac.unidades', foreignKeyLeft: 'unidade_id' }
            }
        }
    }
}

module.exports = new Papeis()
