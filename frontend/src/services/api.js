import axios from "axios";

// 🧹 Normaliza a URL da API para evitar barras duplas ou espaços
let base = (process.env.REACT_APP_API_URL || "").trim();
if (base.endsWith("/")) {
  base = base.slice(0, -1);
}

// Adiciona /api como base para todas as requisições
const api = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000, // 15s para evitar travamentos
  withCredentials: true, // Importante se usar cookies
});

// Interceptor: adiciona o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@SynchroGest:token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: trata erros globais (principalmente 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    if (response?.status === 401) {
      // Força logout somente se for erro de autenticação
      if (config.url.includes("/auth/")) {
        localStorage.removeItem("@SynchroGest:token");
        localStorage.removeItem("@SynchroGest:user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Função auxiliar para login (FastAPI espera x-www-form-urlencoded)
 */
export const login = async (email, password) => {
  const data = new URLSearchParams();
  data.append("username", email); // FastAPI espera "username"
  data.append("password", password);

  const response = await api.post("/auth/login", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export default api;
