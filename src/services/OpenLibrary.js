import axios from 'axios';

export const BOOKS_PER_PAGE = 20;

const api = axios.create({
  baseURL: 'https://openlibrary.org',
  timeout: 15000,
});

// Intervalo para respeitar o limite da API.
let nextRequestTime = 0;

const getWithLimit = async (url, config = {}) => {
  const now = Date.now();
  const wait = Math.max(0, nextRequestTime - now);

  nextRequestTime = now + wait + 1100;

  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  return api.get(url, config);
};

// Retorna uma página de livros.
export const getBooks = async (page = 1, query = 'fantasy') => {
  const response = await getWithLimit('/search.json', {
    params: {
      q: query,
      page: page,
      limit: BOOKS_PER_PAGE,
      fields: 'key,title,author_name,cover_i,first_publish_year',
    },
  });

  return response.data;
};

// Pesquisa livros pelo termo e tipo selecionado.
export const searchBooks = async (term, type = 'all') => {
  const params = {
    limit: 20,
    fields: 'key,title,author_name,cover_i,first_publish_year',
  };

  if (type === 'title') {
    params.title = term;
  } else if (type === 'author') {
    params.author = term;
  } else {
    params.q = term;
  }

  const response = await getWithLimit('/search.json', {
    params,
  });

  return response.data;
};

// Retorna os detalhes de uma obra.
export const getBookDetails = async (workId) => {
  const id = workId.split('/').pop();

  const response = await getWithLimit(`/works/${id}.json`);

  return response.data;
};

// Monta a URL da capa.
export const getCoverUrl = (coverId) => {
  if (!coverId) return null;

  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
};