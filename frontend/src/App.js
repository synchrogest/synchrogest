import React, { useEffect } from 'react'; // Added useEffect import
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Produtos from './pages/produtos/Produtos';
import Categorias from './pages/categorias/Categorias';
import Movimentacoes from './pages/movimentacoes/Movimentacoes';
import Usuarios from './pages/auth/Usuarios';

import Clientes from './pages/clientes/Clientes';
import Vendas from './pages/vendas/Vendas';
import NotFound from './pages/common/NotFound';

// Componentes de layout
import PrivateRoute from './components/auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';

function App() {
  // Adicionado useEffect para testar a conexão com o backend via proxy
  useEffect(() => {
    fetch('/api/test') // Usa a URL relativa que o proxy deve interceptar
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => console.log('RESPOSTA BACKEND (via proxy test):', data))
      .catch(err => console.error('ERRO DE TESTE PROXY:', err));
  }, []); // Array vazio para rodar apenas uma vez

  // Removido AuthProvider e Router daqui, pois estão em index.js
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="movimentacoes" element={<Movimentacoes />} />
        <Route path="usuarios" element={<Usuarios />} />

        <Route path="clientes" element={<Clientes />} />
        <Route path="vendas" element={<Vendas />} />
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
