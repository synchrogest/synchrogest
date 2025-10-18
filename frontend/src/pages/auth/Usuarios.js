import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import AdminAuth from './AdminAuth';
import { useNavigate } from 'react-router-dom';

const Usuarios = () => {
  const navigate = useNavigate();
  
  // Estado para controlar a autenticação de administrador
  const [showAdminAuth, setShowAdminAuth] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  
  // Estados para gerenciar usuários
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para o modal de criação/edição
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados para o formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel_acesso: 'usuario',
    ativo: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  
  // Estados para confirmação de desativação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);

  // Buscar usuários ao carregar o componente e quando a autenticação for verificada
  useEffect(() => {
    if (isAdminVerified) {
      fetchUsuarios();
    }
  }, [isAdminVerified]);

  // Função para buscar usuários
  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/usuarios/');
      setUsuarios(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Não foi possível carregar a lista de usuários. Verifique sua conexão e permissões.');
    } finally {
      setLoading(false);
    }
  };

  // Funções para o modal de criação/edição
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      nivel_acesso: 'usuario',
      ativo: true
    });
    setFormErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleShowCreateModal = () => {
    setModalTitle('Adicionar Novo Usuário');
    setEditMode(false);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleShowEditModal = (usuario) => {
    setModalTitle('Editar Usuário');
    setEditMode(true);
    setSelectedUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Não preencher senha na edição
      nivel_acesso: usuario.nivel_acesso,
      ativo: usuario.ativo
    });
    setShowModal(true);
  };

  // Funções para o formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpar erro do campo quando o usuário digita
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!editMode && !formData.senha.trim()) {
      errors.senha = 'Senha é obrigatória para novos usuários';
    } else if (formData.senha.trim() && formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitError(null);
    setSubmitSuccess(null);
    
    try {
      if (editMode) {
        // Preparar dados para atualização (apenas campos preenchidos)
        const updateData = {
          nome: formData.nome,
          email: formData.email,
          nivel_acesso: formData.nivel_acesso,
          ativo: formData.ativo
        };
        
        // Incluir senha apenas se foi preenchida
        if (formData.senha.trim()) {
          updateData.senha = formData.senha;
        }
        
        await api.put(`/usuarios/${selectedUser.id}`, updateData);
        setSubmitSuccess('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await api.post('/usuarios/', {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          nivel_acesso: formData.nivel_acesso
        });
        setSubmitSuccess('Usuário criado com sucesso!');
      }
      
      // Atualizar lista de usuários
      fetchUsuarios();
      
      // Fechar modal após 1.5 segundos para mostrar a mensagem de sucesso
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
      
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setSubmitError(err.response.data.detail);
      } else {
        setSubmitError('Ocorreu um erro ao salvar o usuário. Tente novamente.');
      }
    }
  };

  // Funções para confirmação de desativação
  const handleShowConfirmModal = (usuario) => {
    setUserToDeactivate(usuario);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setUserToDeactivate(null);
  };

  const handleDeactivateUser = async () => {
    if (!userToDeactivate) return;
    
    try {
      await api.delete(`/usuarios/${userToDeactivate.id}`);
      fetchUsuarios();
      handleCloseConfirmModal();
    } catch (err) {
      console.error('Erro ao desativar usuário:', err);
      setError('Não foi possível desativar o usuário. Verifique suas permissões.');
      handleCloseConfirmModal();
    }
  };

  // Funções para autenticação de administrador
  const handleAdminAuthSuccess = () => {
    setIsAdminVerified(true);
    setShowAdminAuth(false);
  };

  const handleAdminAuthCancel = () => {
    // Redirecionar para o Dashboard se o usuário cancelar a autenticação
    navigate('/dashboard');
  };

  // Renderização condicional para autenticação de administrador
  if (!isAdminVerified) {
    return (
      <AdminAuth 
        show={showAdminAuth} 
        onHide={handleAdminAuthCancel} 
        onSuccess={handleAdminAuthSuccess} 
      />
    );
  }

  // Renderização condicional para loading e erro
  if (loading && usuarios.length === 0) {
    return (
      <Container fluid className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando usuários...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h1 className="h3">Gerenciamento de Usuários</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowCreateModal}>
            <FaUserPlus className="me-2" />
            Novo Usuário
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Nível de Acesso</th>
                <th>Status</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <Badge bg={usuario.nivel_acesso === 'admin' ? 'danger' : 'info'}>
                        {usuario.nivel_acesso === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={usuario.ativo ? 'success' : 'secondary'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td>{new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleShowEditModal(usuario)}
                      >
                        <FaEdit />
                      </Button>
                      {usuario.ativo ? (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleShowConfirmModal(usuario)}
                        >
                          <FaTimes />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleShowEditModal(usuario)}
                        >
                          <FaCheck />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de Criação/Edição de Usuário */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && (
              <Alert variant="danger">{submitError}</Alert>
            )}
            
            {submitSuccess && (
              <Alert variant="success">{submitSuccess}</Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                isInvalid={!!formErrors.nome}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.nome}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                {editMode ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
              </Form.Label>
              <Form.Control
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                isInvalid={!!formErrors.senha}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.senha}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nível de Acesso</Form.Label>
              <Form.Select
                name="nivel_acesso"
                value={formData.nivel_acesso}
                onChange={handleInputChange}
              >
                <option value="usuario">Usuário</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
            
            {editMode && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Usuário Ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Desativação */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Desativação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja desativar o usuário <strong>{userToDeactivate?.nome}</strong>?
          <br />
          Esta ação pode ser revertida posteriormente.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeactivateUser}>
            Desativar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Usuarios;
