/**
 * Class Association
 *
 * @author      Adriano Moura
 * @package     app.Core.Orm
 */
'use strict'
/**
 * Modelo para associações, hasOne e hasMany
 */
class Association {
    /**
     * Método de inicalização para definir as propriedades de associação
     *
     * @param   {Object}    Schema  propriedades de cada associação
     */
    constructor() {
        this.hasOne:  { table: '', foreignKeyLeft: 'id', tableRight: '',  foreignKeyRight: 'id', fields: []}
        this.hasMany: { table: '', foreignKeyLeft: 'id', tableBridge: '', foreignKeyBridgeLeft: '', foreignKeyBridgeRight: '', tableRight: '', foreignKeyRight: 'id', fields: []}
    }
}

module.exports = new Association