import axios from "axios";

let base = process.env.REACT_APP_API_URL || "";
// Remove qualquer barra final para evitar "//api"
if (base.endsWith("/")) {
  base = base.slice(0, -1);
}

const api = axios.create({
  baseURL: `${base}/api`,
  maxRedirects: 5,
  withCredentials: true,
});

// Preserva cabeçalhos em redirecionamentos
api.defaults.maxRedirects = 5;
api.defaults.withCredentials = true;

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('@SynchroGest:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Importante: garantir que os cabeçalhos sejam preservados em redirecionamentos
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


// Interceptor para tratamento de erros nas respostas

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Tratamento de erro de autenticação (401)
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('@SynchroGest:token');
//       localStorage.removeItem('@SynchroGest:user');
//       // Evitar loop de redirecionamento se já estiver no login
//       if (window.location.pathname !== '/login') {
//           window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  response => response,
  error => {
    const { response, config } = error;
    if (response?.status === 401) {
      // Se for rota de autenticação, força logout
      if (config.url.includes('/auth/')) {
        localStorage.removeItem('@SynchroGest:token');
        localStorage.removeItem('@SynchroGest:user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // SENÃO: deixe o erro para o componente decidir (modo somente leitura)
    }
    return Promise.reject(error);
  }
);


export default api;

