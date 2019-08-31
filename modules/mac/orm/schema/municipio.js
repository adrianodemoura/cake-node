/**
 * Schema Municipio
 * 
 * @author      Adriano Moura
 * @package     app.mac.table.schema
 */
'use strict'
/**
 * Mantém o registro de perfis.
 */
const Schema = require (CORE + '/orm/schema.js')
class Municipio extends Schema {
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
            title: __('Município'),
            type: 'string',
            width: 60,
            not_null: true,
            index: true,
            default: '',
            comment: 'nome do perfil'
        }
        this.schema.uf = {
            title: __('Uf'),
            type: 'string',
            width: 2,
            not_null: true,
            index: true,
            default: 'MG',
            comment: 'unidade federativa'
        }
        this.schema.codi_estd = {
            title: __('Código do Estado'),
            type: 'integer',
            width: 11,
            not_null: true,
            default: '0',
            comment: 'código do estado'
        }
        this.schema.desc_estd = {
            title: __('Estado'),
            type: 'string',
            width: 50,
            not_null: true,
            default: '',
            comment: 'descrição do estado'
        }
    }

}

module.exports = new Municipio()
