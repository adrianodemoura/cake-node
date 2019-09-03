/**
 * Schema Perfil
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de perfis.
 */
const Schema = require (CORE + '/orm/schema.js')
class Perfil extends Schema {
    /**
     * Método de inicialização
     * 
     */
    constructor () {
        super()

        // schema
        this.schema.id = {
            title: __('Código'),
            type: 'number',
            width: 11,
            pk: true,
            index: true,
            comment: 'chave primária'
        }
        this.schema.nome = {
            title: __('Perfil'),
            type: 'string',
            width: 60,
            not_null: true,
            index: true,
            default: '',
            comment: 'nome do perfil'
        }
        this.schema.aplicacao_id = {
            title: __('Id da Aplicação'),
            type: 'number',
            not_null: true,
            default: 1,
            comment: 'aplicação do perfil'
        }
    }

}

module.exports = new Perfil()
