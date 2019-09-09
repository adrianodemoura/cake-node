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
                    foreignKeyRight:        'id',
                    fields:                 ['id', 'nome', 'email']
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

    /**
     * Método antes de validar
     * - força o id da aplicação.
     *
     * @param   {Object}    data        Dados do registro.
     * @return  {Boolean}   boolean     Verdadeiro se deve continuar, Falso se não.
     */
    async beforeValidate() {
        this.data['PapeAplicacaoId'] = configure('codigo_sistema')

        return true
    }
}

module.exports = new Papeis()
