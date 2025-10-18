import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import axios from 'axios';

const AdminAuth = ({ show, onHide, onSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
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
    
    if (!credentials.email.trim()) {
      errors.email = 'Email é obrigatório';
    }
    
    if (!credentials.senha.trim()) {
      errors.senha = 'Senha é obrigatória';
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
    
    setLoading(true);
    setError(null);
    
    try {
      // Criar FormData para enviar como application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', credentials.email); // Backend espera 'username', não 'email'
      formData.append('password', credentials.senha); // Backend espera 'password', não 'senha'
      
      // Verificar credenciais de administrador usando o formato correto
      const response = await api.post('/auth/verify-admin', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Se chegou aqui, a autenticação foi bem-sucedida
      setLoading(false);
      onSuccess(); // Notificar o componente pai que a autenticação foi bem-sucedida
    } catch (err) {
      setLoading(false);
      console.error('Erro na autenticação de administrador:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      } else if (err.response && err.response.status === 403) {
        setError('Você não tem permissão de administrador para acessar esta área.');
      } else {
        setError('Ocorreu um erro durante a autenticação. Tente novamente.');
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Autenticação de Administrador</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-4">
            Por motivos de segurança, confirme suas credenciais de administrador para acessar o gerenciamento de usuários.
          </p>
          
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              isInvalid={!!formErrors.email}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Senha</Form.Label>
            <Form.Control
              type="password"
              name="senha"
              value={credentials.senha}
              onChange={handleInputChange}
              isInvalid={!!formErrors.senha}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.senha}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Verificando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdminAuth;
