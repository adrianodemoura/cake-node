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
        this.hasOne:  {
        	
        	// nome do módulo, exemplo: mac.usuarios
        	table: '',

        	// nome do campo que vai ligar com a tabela da esquerda
        	foreignKeyLeft: 'id',

        	// nome da tabela na ligação da direita
        	tableRight: '',

        	// nome do campo que vai ligar a tabela a direita
        	foreignKeyRight: 'id',

        	// campos que serão retornadas do lado direito
        	fields: []
        },
        this.hasMany: {
        	// nom çadastro que vai fazer a ligação do lado direito, exemplo: mac.perfis
        	table: '', 

        	// nome do campo que vai ligar a tabela da esquerda
        	foreignKeyLeft: 'id', 

        	// nome da tabela que vai servir como ponte entre a tabela da esquerda e direita
        	tableBridge: '', 

        	// nome do campo que vai ligar a tabela da esquerda com a da direita, deve estar na tabela bridge
        	foreignKeyBridgeLeft: '', 

        	// nome do campo que vai ligar a tabela da direita com a tabela da esquerda, deve estar na tabela bridge
        	foreignKeyBridgeRight: '', 

        	// nome da tabela da direita
        	tableRight: '', 

        	// nome do campo que vai ligar a tatbela da direita
        	foreignKeyRight: 'id', 

        	// campos da tabela da direita que serão retornardos, se a propriedade includeHasOne foi configurada, os campos desta propriedades deve ser no formato Alias.field
        	fields: [], 

        	// caso a tabela da direita possua uma ligação hasOne, pode incluíla também. deve inserir o nome da ligação haOne da taela da direita.
        	includeHasOne: []
        }
    }
}

module.exports = new Association