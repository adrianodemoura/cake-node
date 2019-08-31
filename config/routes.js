/**
 * Rotas da aplicação.
 */
'use strict'
/**
 * Configure aqui os redirecionamentos de rotas e as 
 * rotas que serão acessadas sem a validação pelo token.
 */
module.exports = {
    "redirect": {
    	"/" : "/mac/info", 
    	"/cadastros"  : "/mac/cadastros",
        "/instalacao" : "/mac/instalacao",
    	"/meu_token"  : "/mac/meu_token",
    	"/novo_token" : "/mac/novo_token",
    	"/nova_senha" : "/mac/nova_senha"
    },

    "no_authentication": [
    	"/mac/info", 
    	"/mac/instalacao",
    	"/mac/meu_token",
    	"/mac/novo_token",
    	"/mac/nova_senha"
    ]
}