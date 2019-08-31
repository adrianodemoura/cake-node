#/bin/bash

echo " "

#for (( i=0; i<10; i++ ))
#do
# 	echo $i " " 
#	curl --silent -X GET -G http://localhost:3000/minha_chave/ -d email=teste@teste.com.br -d senha=teste
#   echo " "
#done

curl --silent -X GET -G http://localhost:3000/minha_chave/ -d email=teste@teste.com.br -d senha=teste

echo " "
