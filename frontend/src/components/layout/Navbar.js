import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom'; // Manter NavLink
import { useAuth } from '../../contexts/auth/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const AppNavbar = () => {
  const { user, signOut } = useAuth();

  // Estilo para o NavLink ativo (opcional)
  const activeStyle = {
    // Exemplo: pode adicionar um estilo se quiser destacar o brand quando no dashboard
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        {/* Manter NavLink no Navbar.Brand */}
        <Navbar.Brand 
          as={NavLink} 
          to="/dashboard" 
          style={({ isActive }) => isActive ? activeStyle : undefined}
        >
          SynchroGest
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Restaurar lógica do usuário */}
            {user && (
              <NavDropdown 
                title={
                  <>
                    <FaUserCircle className="me-1" />
                    {user.nome} {/* Restaurado */}
                  </>
                }
                id="basic-nav-dropdown"
                align="end"
              >
                {/* Manter NavLink no NavDropdown.Item */}
                <NavDropdown.Item 
                  as={NavLink} 
                  to="/perfil" 
                >
                  Meu Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={signOut}>Sair</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

