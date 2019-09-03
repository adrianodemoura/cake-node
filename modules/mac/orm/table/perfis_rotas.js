/**
 * Table PerfisRotas
 * 
 * @author      Adriano Moura
 * @package     app.module.orm.table
 */
'use strict'
/**
 * Mantém a tabela de usuários.
 */
const Table = require (CORE + '/orm/table.js')
class PerfisRotas extends Table {
    /**
     * Método de inicialização do Municipio
     */
    init () {
        this.table      = 'perfis_rotas'
        this.schemaName = 'perfil_rota'

        // associações
        this.associations = {
            Perfil: {
                hasOne: { table: 'mac.perfis', foreignKeyLeft: 'perfil_id'}
            },
            Rota: {
                hasOne: { table: 'mac.rotas', foreignKeyLeft: 'rota_id'}
            }
        }
    }
}

module.exports = new PerfisRotas()
