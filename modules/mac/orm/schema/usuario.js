/**
 * Schema Usuario
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de perfis.
 */
const Schema = require (CORE + '/orm/schema.js')
class Usuario extends Schema {
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
            comment: 'chave primária',
            index: true
        }
        this.schema.nome = {
            title: __('Usuário'),
            type: 'string',
            width: 100,
            not_null: true,
            index: true,
            default: '',
            comment: 'nome do usuário'
        }
        this.schema.email = {
            title: __('e-mail'),
            type: 'string',
            width: 100,
            not_null: true,
            index: true,
            default: '',
            comment: 'e-mail'
        }
        this.schema.cep = {
            title: __('Cep'),
            type: 'numeric',
            width: 8,
            not_null: true,
            index: true,
            default: 30000000,
            mask: "##.###-###",
            comment: 'cep do usuário'
        }
        this.schema.senha = {
            title: __('senha'),
            type: 'string',
            width: 200,
            not_null: true,
            default: '',
            comment: 'senha do usuário',
            hidden: true
        }
        this.schema.token = {
            title: __('token'),
            type: 'string',
            width: 200,
            not_null: true,
            default: '',
            comment: 'token do usuário',
            hidden: true
        }
        this.schema.cpf = {
            title: __('CPF'),
            type: 'double',
            not_null: true,
            default: 0,
            comment: 'cpf do usuário',
            mask: '###.###.###-###'
        }
        this.schema.celular = {
            title: __('Celular'),
            type: 'double',
            not_null: true,
            default: 0,
            comment: 'celular do usuário',
            mask: '(##) #####-####'
        }
        this.schema.ativo = {
            title: __('Ativo'),
            type: 'tinyint',
            not_null: true,
            default: 1,
            comment: 'flag para verificar se o usuário está ativo'
        }
        this.schema.nascimento = {
            title: __('dt. de Nascimento'),
            type: 'date',
            not_null: true,
            mask: '##/##/####',
            default: '0000-00-00',
            comment: 'data de nascimento do usuário'
        }
        this.schema.salario = {
            title: __('Salário'),
            type: 'decimal',
            width: 12,
            precision: 2,
            not_null: true,
            default: 0,
            mask: 'numberBr',
            comment: 'salário do usuário'
        }
        this.schema.municipio_id = {
            title: __('Id do Município'),
            type: 'int',
            not_null: true,
            default: 3106200,
            comment: 'município do usuário'
        }
        this.schema.criado = {
            title: __('dt. de Criação'),
            type: 'timestamp',
            not_null: true,
            default: 'CURRENT_TIMESTAMP',
            comment: 'data em que o usuário foi criado'
        }
        this.schema.modificado = {
            title: __('dt. de Modificação'),
            type: 'timestamp',
            not_null: true,
            default: 'CURRENT_TIMESTAMP',
            comment: 'data em que o usuário foi modificado'
        }
        this.schema.ultimo_acesso = {
            title: __('dt. do Último Acesso'),
            type: 'timestamp',
            not_null: true,
            default: '0000-00-00 00:00:00',
            comment: 'data em que o usuário acessou o api pela última vez'
        }
        this.schema.acessos = {
            title: __('qtd. Acessos'),
            type: 'number',
            not_null: true,
            default: 0,
            width: 11,
            comment: 'quantidade de acessos do usuário'
        }
    }

}

module.exports = new Usuario()
