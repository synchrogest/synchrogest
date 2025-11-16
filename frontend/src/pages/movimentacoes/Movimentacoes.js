import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { FaPlus, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Estado do formulário do modal
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: 'entrada',
    quantidade: 1,
    observacoes: '',
  });

  // Estado dos filtros
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Buscar movimentações
  const fetchMovimentacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroProduto) params.produto_id = filtroProduto;
      if (filtroTipo) params.tipo = filtroTipo;

      const response = await api.get('/movimentacoes/', { params });
      setMovimentacoes(response.data);
    } catch (err) {
      setError('Erro ao buscar movimentações.');
      toast.error('Erro ao buscar movimentações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filtroProduto, filtroTipo]);

  // Buscar produtos
  const fetchProdutos = useCallback(async () => {
    try {
      const response = await api.get('/produtos/', { params: { limit: 1000 } });
      setProdutos(response.data);
    } catch (err) {
      toast.error('Erro ao buscar produtos.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
    fetchMovimentacoes();
  }, [fetchProdutos, fetchMovimentacoes]);

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    setFormData({ produto_id: '', tipo: 'entrada', quantidade: 1, observacoes: '' });
  };

  const handleShowCreateModal = () => {
    setFormData({ produto_id: '', tipo: 'entrada', quantidade: 1, observacoes: '' });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveMovimentacao = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const dataToSave = {
      ...formData,
      quantidade: parseInt(formData.quantidade, 10),
      produto_id: parseInt(formData.produto_id, 10),
    };

    if (isNaN(dataToSave.produto_id)) {
      setModalError('Selecione um produto válido.');
      setModalLoading(false);
      return;
    }
    if (isNaN(dataToSave.quantidade) || dataToSave.quantidade <= 0) {
      setModalError('A quantidade deve ser maior que zero.');
      setModalLoading(false);
      return;
    }

    try {
      await api.post('/movimentacoes/', dataToSave);
      toast.success('Movimentação registrada com sucesso!');
      handleCloseModal();
      fetchMovimentacoes();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao registrar movimentação.';
      setModalError(errorMsg);
      toast.error(`Erro: ${errorMsg}`);
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      return new Date(dateTimeString).toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Histórico de Movimentações</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filtros */}
      <Row className="mb-3 p-3 border rounded bg-light mx-1">
        <Col md={12} className="mb-2"><FaFilter className="me-1" /> Filtros:</Col>
        <Col md={3} sm={6} className="mb-2">
          <Form.Group controlId="filtroProduto">
            <Form.Label>Produto</Form.Label>
            <Form.Select value={filtroProduto} onChange={(e) => setFiltroProduto(e.target.value)}>
              <option value="">Todos</option>
              {produtos.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.nome} ({prod.codigo_sku})</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} sm={6} className="mb-2">
          <Form.Group controlId="filtroTipo">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Button variant="success" onClick={handleShowCreateModal} className="mb-3">
        <FaPlus className="me-1" /> Nova Movimentação
      </Button>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando movimentações...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Qtd.</th>
              <th>Usuário</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">Nenhuma movimentação encontrada.</td>
              </tr>
            ) : (
              movimentacoes.map((mov) => (
                <tr key={mov.id}>
                  <td>{mov.id}</td>
                  <td>{formatDateTime(mov.data)}</td>
                  <td>{produtos.find(p => p.id === mov.produto_id)?.nome || 'N/A'}</td>
                  <td>
                    <span className={`badge bg-${mov.tipo === 'entrada' ? 'success' : 'danger'}`}>
                      {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                    </span>
                  </td>
                  <td>{mov.quantidade}</td>
                  <td>ID: {mov.usuario_id}</td>
                  <td>{mov.observacoes}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para Nova Movimentação */}
     <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nova Movimentação</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveMovimentacao}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}

            <Form.Group className="mb-3" controlId="formMovProduto">
              <Form.Label>Produto</Form.Label>
              <Form.Select
                name="produto_id"
                value={formData.produto_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione o produto...</option>
                {produtos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nome} ({prod.codigo_sku}) - Estoque: {prod.quantidade}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMovTipo">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMovQuantidade">
                  <Form.Label>Quantidade</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formMovObservacoes">
              <Form.Label>Observações (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observacoes"
                value={formData.observacoes}
                onChange={handleFormChange}
                placeholder="Ex.: ajuste de estoque, devolução, etc."
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Registrando...
                </>
              ) : (
                'Registrar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Movimentacoes;
