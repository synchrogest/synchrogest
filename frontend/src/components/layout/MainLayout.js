
import { FaBars, FaBox, FaBoxOpen, FaChartLine, FaClipboardList, FaHome, FaSignOutAlt, FaTags, FaUsers, FaTasks } from 'react-icons/fa';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
// import { useAuth } from '../../contexts/auth';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useState } from 'react';

const MainLayout = ({ children }) => {
  // const { logout } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    // logout();
    signOut();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="primary" variant="dark" expand={false} className="mb-3">
        <Container fluid>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-light"
              className="me-2 d-md-none"
              onClick={handleShow}
            >
              <FaBars />
            </Button>
            <Navbar.Brand as={Link} to="/" className="me-auto">
              SynchroGest
            </Navbar.Brand>
          </div>
          <Button
            variant="outline-light"
            onClick={handleLogout}
            className="d-flex align-items-center"
          >
            <FaSignOutAlt className="me-2" /> Sair
          </Button>
        </Container>
      </Navbar>

      <Container fluid className="flex-grow-1 d-flex">
        {/* Sidebar para telas médias e grandes */}
        <div className="d-none d-md-flex flex-column sidebar bg-light p-3">
          <Nav className="flex-column bg-light p-2">
            <Nav.Link
              as={Link}
              to="/dashboard"
              className={`mb-2 ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <FaHome className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/produtos"
              className={`mb-2 ${isActive('/produtos') ? 'active' : ''}`}
            >
              <FaBox className="me-2" /> Produtos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/categorias"
              className={`mb-2 ${isActive('/categorias') ? 'active' : ''}`}
            >
              <FaTags className="me-2" /> Categorias
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/movimentacoes"
              className={`mb-2 ${isActive('/movimentacoes') ? 'active' : ''}`}
            >

              {/* Bug de UI (Texto quebra) */}
              <FaChartLine className="me-2" /> Movimentações
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/clientes"
              className={`mb-2 d-flex ${isActive('/clientes') ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <FaClipboardList className="me-3" /> Clientes
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/vendas"
              className={`mb-2 ${isActive('/vendas') ? 'active' : ''}`}
            >
              <FaTasks className="me-2" /> Vendas
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/pagamentos"
              className={`mb-2 ${isActive('/pagamentos') ? 'active' : ''}`}
            >
              <FaTasks className="me-2" /> Pagamentos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/usuarios"
              className={`mb-2 ${isActive('/usuarios') ? 'active' : ''}`}
            >
              <FaUsers className="me-2" /> Usuários
            </Nav.Link>
          </Nav>
        </div>

        {/* Offcanvas para dispositivos móveis */}
        <Offcanvas show={show} onHide={handleClose} className="sidebar-mobile">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              <Nav.Link
                as={Link}
                to="/dashboard"
                className={`mb-2 ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaHome className="me-2" /> Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/produtos"
                className={`mb-2 ${isActive('/produtos') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaBox className="me-2" /> Produtos
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/categorias"
                className={`mb-2 ${isActive('/categorias') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaTags className="me-2" /> Categorias
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/movimentacoes"
                className={`mb-2 ${isActive('/movimentacoes') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaChartLine className="me-2" /> Movimentações
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/clientes"
                className={`mb-2 ${isActive('/clientes') ? 'active' : ''}`}
              >
                <FaClipboardList className="me-2" /> Clientes
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/vendas"
                className={`mb-2 ${isActive('/vendas') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaClipboardList className="me-2" /> Vendas
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/pagamentos"
                className={`mb-2 ${isActive('/pagamentos') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaClipboardList className="me-2" /> Pagamentos
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/usuarios"
                className={`mb-2 ${isActive('/usuarios') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <FaUsers className="me-2" /> Usuários
              </Nav.Link>
              <Nav.Link
                as={Link}
              >
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        <div className="flex-grow-1 content-area">
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default MainLayout;
