# Minha Estante 📚

Aplicativo mobile de catálogo de livros desenvolvido com **React Native e Expo** para a disciplina de **Mobile Development: Framework**. O aplicativo consulta dados públicos da **Open Library API** e permite que cada usuário organize suas leituras.

## Funcionalidades

- Cadastro e login **locais**, com sessão persistente e logout.
- Catálogo de livros com capas, autores e **rolagem infinita**.
- Atualização do catálogo ao puxar a lista para baixo (*pull-to-refresh*).
- Busca de livros por termo geral, título ou autor.
- Tela de detalhes com capa, descrição e assuntos relacionados, quando disponíveis na API.
- Lista de livros favoritos, sincronizada entre as telas do aplicativo.
- Lista de livros lidos e avaliações pessoais de **1 a 5 estrelas**.
- Persistência local de favoritos, livros lidos e notas, separada por usuário.
- Indicadores de carregamento, mensagens de erro e recursos de acessibilidade.

## Tecnologias utilizadas

- **React Native + Expo** — desenvolvimento do aplicativo.
- **JavaScript** — linguagem de programação.
- **Axios** — requisições HTTP à Open Library.
- **React Navigation (Native Stack)** — navegação entre telas.
- **Context API** — gerenciamento global de autenticação e da estante.
- **AsyncStorage** — armazenamento local de favoritos, livros lidos e avaliações.
- **Expo SecureStore** — armazenamento protegido das informações locais de autenticação e da sessão.
- **Expo Crypto** — identificadores e hash com salt no login local didático.

## Pré-requisitos

Antes de executar, instale:

1. **Node.js (versão LTS)**, que inclui `npm` e `npx`: https://nodejs.org/
2. **Git**, caso queira clonar o repositório: https://git-scm.com/
3. **Expo Go** no celular Android ou iOS, ou um emulador compatível.

Para verificar a instalação do Node.js e do npm, execute:

```bash
node -v
npm -v
npx -v
```

## Como executar o projeto

### 1. Obter os arquivos

Clone o repositório (substitua o endereço abaixo pelo endereço real do projeto):

```bash
git clone https://github.com/Helengendary/Minha_Estante.git
cd Minha-Estante
```

Se você já baixou ou clonou o projeto, apenas abra a pasta **minha-estante** no VS Code e abra um terminal nela.

### 2. Instalar as dependências

Na pasta que contém o arquivo `package.json`, execute:

```bash
npm install
```

### 3. Iniciar o Expo

```bash
npx expo start
```

O terminal exibirá um **QR Code**.

### 4. Abrir o aplicativo

- **No Android:** abra o Expo Go e escaneie o QR Code.
- **No iPhone:** escaneie o QR Code pela câmera e siga a opção de abrir no Expo Go.
- **No emulador:** com um emulador compatível instalado e iniciado, siga as opções exibidas no terminal do Expo.

Normalmente, o computador e o celular precisam estar conectados à **mesma rede Wi-Fi**.

### 5. Criar uma conta e testar

Na primeira execução, selecione **Cadastre-se**, informe nome, e-mail e uma senha de teste com pelo menos **8 caracteres**. Após o cadastro, o aplicativo abrirá o catálogo automaticamente.

Você poderá pesquisar livros, abrir detalhes, salvar favoritos, marcar livros como lidos e avaliá-los. Para testar a persistência, feche completamente o aplicativo e abra-o novamente. Os dados locais e a sessão deverão ser recuperados.

> **Importante:** o login é local e foi desenvolvido para fins acadêmicos. As contas não são sincronizadas com outros aparelhos nem possuem recuperação de senha por e-mail. Não utilize senhas reais ou reutilizadas de outros serviços.

## Estrutura principal do projeto

```text
minha-estante/
├── App.js
├── src/
│   ├── components/
│   │   ├── BookCard.js
│   │   ├── SearchResultCard.js
│   │   └── RatingStars.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── CatalogScreen.js
│   │   ├── SearchScreen.js
│   │   ├── BookDetailsScreen.js
│   │   ├── FavoriteScreen.js
│   │   └── ReadBooksScreen.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── BookContext.js
│   ├── hooks/
│   │   └── useBooks.js
│   └── services/
│       ├── OpenLibrary.js
│       ├── storage.js
│       └── authStorage.js
└── package.json
```

## API utilizada

O projeto utiliza a **Open Library API**, pública e gratuita:

- Documentação: https://openlibrary.org/developers/api
- Busca e catálogo paginado: `https://openlibrary.org/search.json?q=fantasy&page=1&limit=20`
- Detalhes de uma obra: `https://openlibrary.org/works/OL27448W.json`

As informações e capas dependem da disponibilidade dos dados na Open Library. O aplicativo apresenta mensagens ou espaços reservados quando algum dado está ausente.

## Solução de problemas

**`npm` ou `npx` não é reconhecido:** instale a versão LTS do Node.js, feche e reabra o terminal e execute novamente `node -v`, `npm -v` e `npx -v`.

**O aplicativo não conecta ao Expo Go:** verifique se o computador e o celular estão na mesma rede. Se necessário, experimente:

```bash
npx expo start --tunnel
```

**O aplicativo não atualiza após uma alteração:** encerre o processo e limpe o cache do Expo:

```bash
npx expo start -c
```

**A lista de livros não carrega:** verifique a conexão com a internet. O catálogo e a pesquisa dependem da Open Library; já os favoritos e as avaliações são salvos localmente.

## Observações sobre os dados

- Os dados pessoais da estante são salvos **localmente no dispositivo** e separados por conta.
- O aplicativo **não possui backend próprio** nem sincronização em nuvem.
- As senhas não são gravadas em texto puro; a autenticação implementada é uma solução local didática, **não indicada para uso em produção**.
- Limpar os dados ou desinstalar o aplicativo pode apagar as informações locais.

## Contexto acadêmico

Projeto somativo desenvolvido para a disciplina de **Mobile Development: Framework**, utilizando React Native, Expo e uma API pública de livros para demonstrar componentes, hooks, navegação, Context API, persistência e autenticação local.
