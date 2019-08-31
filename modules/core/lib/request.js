/**
 * Function Request
 * 
 * @author 		Adriano Moura
 * @package 	app.Core.Lib
 */
'use strict'
/**
 * Retorna os parâmetros repassados pelo lado cliente.
 * tais como headers, body e query.
 * 
 * @param   {Object}    request
 * @return  {Object}    params
 */
module.exports = function(request) {
    let params = {}

    params = Object.assign(params, request.headers)
    params = Object.assign(params, request.body)
    params = Object.assign(params, request.query)

    return params
}