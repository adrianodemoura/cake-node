#/bin/bash
#
# Executa a instalação do banco de dados do módulo mac.

if [ -z $1 ]; then
	echo "O primeiro parâmetro deve ser o e-mail !"
	exit 0
fi
if [ -z $2 ]; then
	echo "O segundo parâmetro deve ser a senha !"
	exit 0
fi


email=$1
senha=$2
drop=$([ -z $3 ] && echo true || echo $3)
csv=$([ -z $4 ] && echo 'min' || echo $4)
porta=$([ -z $5 ] && echo 3000 || echo $5)

url=" --silent -X GET -G http://localhost:$porta/mac/instalacao/"
url+=" -d email=$email"
url+=" -d senha=$senha"
url+=" -d drop=$drop"
url+=" -d csv=$csv"

##echo $url

curl `echo $url`

echo " "

