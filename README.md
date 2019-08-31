# CakeNode

===========================

Mini framework feito em NodeJS baseado no cakePHP.

## Considerações
`CakeNode` é um exemplo de API, bem simples, feito em nodeJs. 
Todas as rotas são autenticadas por Token. Cada novo usuário possui um.
Novas rotas podem ser implementadas no diretório `rotas`.

### Requisitos
- node, nodemon e npm
- mysql ou sqlite3

### Instalação
```sh
$ cd {seus_projetos_nodeJs}
$ git clone https://github.com/adrianodemoura/cake-node.git api-node
ou
$ git clone git@github.com:adrianodemoura/cake-node.git api-node
$ cd cake-node
$ npm install
$ node server.js 
```

Acesse a rota:

`/instalacao`

Informe o e-mail e senha do usuário administrador, o sistema irá gerar um token para este usuário, a partir daí, é possível acessar as demais rotas, veja mais sobre rotas no ítem `Principais rotas`.


### Configurações
o CakeNode pode ser configurada através do diretório `config`.

O arquivo `config/ambiente.js` contém a configuração do ambiente, este arquivo determina se o seu servido é `desenvolvimento`, `homologação` ou `produção`.

O arquiv `config/config.js` contém as configurações gerais da aplicação.

O arquivo `config/config_{ambiente}` contém as configurações típicas de cada ambiente, como a porta do servidor, configuração do banco de dados e o idioma.

Embora a prática não seja aconselhada, no arquivo `config/bootstrap.js` é possível configurar variáveis e funções globais. 

A variável de configuração `SALT` é criada no momento da instalação inicial.

#### Variáveis globais

Para facilitar o acesso algumas variáveis globais foram criadas:

MEU_IP = ip corrente

ROTA = rota corrente

ROOT = caminho da aplicação

LOCALGES = variáveis de idioma.

### Principais rotas

/rotas 		- Retorna todas as rotas da aplião com um pequeno resumo.

/listar 	- Retorna a lista paginada de um cadastro (acesse a rota `cadastros` para ver quais estão disponíveis).

/excluir 	- Exclui o registro de um cadastro.

/salvar 	- Inclui ou Atualiza um registro do cadastro.

/sac/meu_token 	- Retorna o token do cliente.

```
* inclua o parâmetro `doc` para receber a documentação de cada rota.
```

### Glossário

* API: Inferface de Programação de Aplicações.

* rotas: url a ser consumidada pela API, por exemplo /listar, /salvar, /meu_token e as demais que forem implementadas.

* parâmetros: são os dados que o cliente deve envir ao servidor, cada rota possui seus parãmetros.

* cadastro: São os dados da API, por exemplo: usuários, municípios e auditorias são os cadastros principais desta api.

* core: Conjunto de códigos que formam o coração do CakeNode, não é aconselhável a sua alteração, mas sim sua leitura.

* sac: é o módulo, exemplo, de autenticação centralizada, é através deste módulo que são cadastrados os usuários da aplicação.

### Recomendações

* o CakeNode não foi feito pra salvar o mundo, mas serve como referência da tecnologia.

* Se achar que pode melhorar o código, não critique, faça um fork e uma pull request. Críticas construtivas sempre são bem vindas.

* Ajude nas ISSUEs.

* Deixe de preguiça e leia o código.
