/**
 * Schema PerfilRota
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de PerfilRota.
 */
const Schema = require (CORE + '/orm/schema.js')
class PerfilRota extends Schema {
    /**
     * Método de inicialização
     */
    constructor () {
        super()

        this.schema.rota_id = {
            title: __('id da rota'),
            type: 'number',
            comment: 'ligação com rotas'
        }
        this.schema.perfil_id = {
            title: __('id do Perfil'),
            type: 'number',
            comment: 'ligação com perfis'
        }
    }

}

module.exports = new PerfilRota()
