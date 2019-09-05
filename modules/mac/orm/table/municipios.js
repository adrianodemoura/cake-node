/**
 * Table Municipios
 * 
 * @author      Adriano Moura
 * @package     app.module.orm.table
 */
'use strict'
/**
 * Mantém a tabela de municipios.
 */
const Table = require (CORE + '/orm/table.js')
class Municipios extends Table {
    /**
     * Método de inicialização do Municipio
     */
    init () {
        this.table      = 'municipios'
        this.schemaName = 'municipio'

        this.associations = {
            Usuarios: {
                hasMany: {
                    table: 'mac.usuarios',
                    tableRight: 'usuarios',
                    foreignKeyRight: 'municipio_id'
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create','update'], msg: __('O Campo ativo é obrigatório')}
            }
        }

    }

    /**
     * Retorna a lista de estados
     *
     * @return  {Array}     lista   Lista de estado no formato codigo-estado=descrição estado
     */
    async getListaEstado () {
        let params      = {}
        params.type     = 'list'
        params.fields   = ['Muni.codi_estd', 'Muni.desc_estd'] 
        params.group    = ['Muni.codi_estd', 'Muni.desc_estd']
        params.sort     = {'Muni.desc_estd': 'ASC'}

        let lista = await this.find(params)

        return lista
    }
}

module.exports = new Municipios()
