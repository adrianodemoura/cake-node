#/bin/sh
# Retorna a lista de um cadastro
# parâmetros: cadastro, pagina, filtro e campos da lista
#

if [ -z $1 ]; then
	echo "O cadastro é obrigatório !"
	exit 0
fi

cadastro=$1
#[ -z $2 ] && pagina=1 || pagina=$2
#[! -z $2 ] && pagina=$2 || pagina=1
pagina=$([ -z $2 ] && echo 1 || echo $2)
limite=$([ -z $3 ] && echo 10 || echo $3)

echo " ================================"
echo " Recuperando lista de $cadastro"
echo " página: $pagina"
echo " limite: $limite"
echo " --------------------------------"

url=" --silent -X GET -G http://localhost:3000/listar/"
url+=" -d chave=7850a59ead411a3c5996ecada8a30c3358ad90a439134a358272b6b71810e14fd4fe59cb6674c8e18a2fb6be0ba4a44c0e54370d6ae4e7e14c2d47a89dd3307e"
url+=" -d cadastro=$cadastro"
url+=" -d pagina=$pagina"
url+=" -d limite=$limite"

if [ ! -z "$4" ]; then
 	url+=" -d campos=$campos"
 	echo " campos: $campos"
fi

if [ -z "$5" ]; then
	url+=" -d filtros=$filtros"
	echo " filtros: $filtros"
fi

curl `echo $url`

echo " ** fim **"
