import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom'; // Importar NavLink
import { FaTachometerAlt, FaBoxOpen, FaTags, FaExchangeAlt, FaProjectDiagram, FaUsers } from 'react-icons/fa';

const Sidebar = () => {
  // Estilo para o NavLink ativo
  const activeStyle = {
    fontWeight: 'bold',
    color: '#0d6efd', // Cor primária do Bootstrap
    backgroundColor: 'rgba(13, 110, 253, 0.1)' // Fundo levemente azulado
  };

  return (
    <Nav className="flex-column bg-light sidebar" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, paddingTop: '56px', width: '250px' }}>
      {/* Usar NavLink em vez de LinkContainer */}
      <Nav.Link 
        as={NavLink} 
        to="/dashboard" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaTachometerAlt className="me-2" /> Dashboard
      </Nav.Link>
      <Nav.Link 
        as={NavLink} 
        to="/categorias" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaTags className="me-2" /> Categorias
      </Nav.Link>
      <Nav.Link 
        as={NavLink} 
        to="/produtos" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaBoxOpen className="me-2" /> Produtos
      </Nav.Link>
      <Nav.Link 
        as={NavLink} 
        to="/movimentacoes" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaExchangeAlt className="me-2" /> Movimentações
      </Nav.Link>
      <Nav.Link 
        as={NavLink} 
        to="/projetos" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaProjectDiagram className="me-2" /> Projetos
      </Nav.Link>
      {/* Adicionar link para usuários se o usuário for admin - lógica a ser implementada */}
      <Nav.Link 
        as={NavLink} 
        to="/usuarios" 
        className="d-flex align-items-center"
        style={({ isActive }) => isActive ? activeStyle : undefined}
      >
        <FaUsers className="me-2" /> Usuários
      </Nav.Link>
    </Nav>
  );
};

export default Sidebar;

