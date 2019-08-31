#/bin/sh

echo " "

curl POST http://localhost:3000/crud/salvar/ \
    -d chave=7850a59ead411a3c5996ecada8a30c3358ad90a439134a358272b6b71810e14fd4fe59cb6674c8e18a2fb6be0ba4a44c0e54370d6ae4e7e14c2d47a89dd3307e \
    -d cadastro=usuario \
    -d data={nome: 'josé fugêncio gomes lima', email: 'jose1@email.com.br', ativo: 1}

echo " "
