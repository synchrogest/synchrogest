import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState(null); // Para edição
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Função para buscar categorias
  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categorias/');
      setCategorias(response.data);
    } catch (err) {
      setError('Erro ao buscar categorias.');
      toast.error('Erro ao buscar categorias.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar categorias ao montar o componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  // Funções para controlar o modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCategoriaAtual(null);
    setNome('');
    setDescricao('');
    setError(null); // Limpar erro do modal
  };

  const handleShowCreateModal = () => {
    setCategoriaAtual(null);
    setNome('');
    setDescricao('');
    setShowModal(true);
  };

  const handleShowEditModal = (categoria) => {
    setCategoriaAtual(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setShowModal(true);
  };

  // Função para salvar (criar ou atualizar) categoria
  const handleSaveCategoria = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    const data = { nome, descricao };

    try {
      if (categoriaAtual) {
        // Atualizar categoria
        await api.put(`/categorias/${categoriaAtual.id}`, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await api.post('/categorias/', data);
        toast.success('Categoria criada com sucesso!');
      }
      handleCloseModal();
      fetchCategorias(); // Atualizar a lista
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao salvar categoria.';
      setError(errorMsg);
      toast.error(`Erro ao salvar categoria: ${errorMsg}`);
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // Função para excluir categoria
  const handleDeleteCategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.delete(`/categorias/${id}`);
        toast.success('Categoria excluída com sucesso!');
        fetchCategorias(); // Atualizar a lista
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Erro ao excluir categoria.';
        toast.error(`Erro ao excluir categoria: ${errorMsg}`);
        console.error(err);
      }
    }
  };

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Gerenciamento de Categorias</h1>

      {error && !showModal && <Alert variant="danger">{error}</Alert>} 

      <Button variant="primary" onClick={handleShowCreateModal} className="mb-3">
        <FaPlus className="me-1" /> Nova Categoria
      </Button>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando categorias...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">Nenhuma categoria encontrada.</td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.nome}</td>
                  <td>{categoria.descricao}</td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => handleShowEditModal(categoria)} className="me-2">
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteCategoria(categoria.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para Criar/Editar Categoria */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{categoriaAtual ? 'Editar Categoria' : 'Nova Categoria'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCategoria}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>} 
            <Form.Group className="mb-3" controlId="formCategoriaNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome da categoria"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCategoriaDescricao">
              <Form.Label>Descrição (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Digite a descrição da categoria"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</>
              ) : (
                'Salvar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Categorias;
