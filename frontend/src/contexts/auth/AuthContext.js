import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Criar o contexto de autenticação
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
    // Função que será executada uma única vez para validar token e carregar usuário
    const bootstrapAuth = async () => {
        const token = localStorage.getItem('@SynchroGest:token');
        if (token) {
        // Configura o header Authorization para todas as requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // Tenta buscar o usuário atual (válida o token no backend)
            const response = await api.get('/auth/me');
            const userData = response.data;
            setUser(userData);

          // Atualiza também o usuário armazenado em localStorage
            localStorage.setItem('@SynchroGest:user', JSON.stringify(userData));
        } catch (err) {
          // Se der erro (por exemplo 401 Unauthorized), limpa tudo
            console.warn('Token inválido ou expirado, forçando logout.', err);

            localStorage.removeItem('@SynchroGest:token');
            localStorage.removeItem('@SynchroGest:user');
            delete api.defaults.headers.common['Authorization'];

            setUser(null);
        }
        }
      // Após a checagem, definimos loading = false para liberar as PrivateRoutes
        setLoading(false);
    };

    bootstrapAuth();
    }, []);

  // Função para fazer login
    const signIn = async (email, password) => {
    try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

      // 1) Autentica no backend e recebe access_token
        const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = response.data;

      // 2) Configura o header Authorization para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        localStorage.setItem('@SynchroGest:token', access_token);

      // 3) Busca os dados do usuário agora que o token já está válido
        const userResponse = await api.get('/auth/me');
        const userData = userResponse.data;
        localStorage.setItem('@SynchroGest:user', JSON.stringify(userData));
        setUser(userData);

      // 4) Redireciona para o dashboard
        navigate('/dashboard');
        toast.success('Login realizado com sucesso!');
    } catch (error) {
        toast.error('Erro ao fazer login. Verifique suas credenciais.');
        console.error('Erro ao fazer login:', error);
        setUser(null);
    } finally {
        setLoading(false);
    }
    };

  // Função para logout
    const signOut = () => {
    localStorage.removeItem('@SynchroGest:token');
    localStorage.removeItem('@SynchroGest:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.info('Logout realizado com sucesso!');
    };

    return (
    <AuthContext.Provider
        value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signOut
        }}
    >
        {children}
    </AuthContext.Provider>
    );
};

// Hook para usar o contexto de autenticação
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

export default AuthContext;
