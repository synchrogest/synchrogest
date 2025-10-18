import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { FaPlus, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [projetos, setProjetos] = useState([]); // Para filtro e modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Estado do formulário do modal
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: 'entrada', // 'entrada' ou 'saida'
    quantidade: 1,
    observacoes: '',
    projeto_id: '', // Opcional
  });

  // Estado dos filtros
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');

  // Função para buscar movimentações com filtros
  const fetchMovimentacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroProduto) params.produto_id = filtroProduto;
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroDataInicio) params.data_inicio = filtroDataInicio;
      if (filtroDataFim) params.data_fim = filtroDataFim;
      if (filtroProjeto) params.projeto_id = filtroProjeto;

      const response = await api.get('/movimentacoes/', { params });
      setMovimentacoes(response.data);
    } catch (err) {
      setError('Erro ao buscar movimentações.');
      toast.error('Erro ao buscar movimentações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar produtos (para dropdown)
  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos/', { params: { limit: 1000 } }); // Buscar mais produtos para o select
      setProdutos(response.data);
    } catch (err) {
      toast.error('Erro ao buscar produtos para o filtro/formulário.');
      console.error(err);
    }
  };

  // Função para buscar projetos (para dropdown)
  const fetchProjetos = async () => {
    try {
      const response = await api.get('/projetos/', { params: { limit: 1000 } }); // Buscar mais projetos para o select
      setProjetos(response.data);
    } catch (err) {
      toast.error('Erro ao buscar projetos para o filtro/formulário.');
      console.error(err);
    }
  };

  // Buscar dados ao montar o componente e quando filtros mudam
  useEffect(() => {
    fetchProdutos();
    fetchProjetos();
    fetchMovimentacoes();
  }, [filtroProduto, filtroTipo, filtroDataInicio, filtroDataFim, filtroProjeto]);

  // Funções para controlar o modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    // Resetar formulário
    setFormData({
      produto_id: '', tipo: 'entrada', quantidade: 1, observacoes: '', projeto_id: '',
    });
  };

  const handleShowCreateModal = () => {
    // Resetar formulário
    setFormData({
      produto_id: '', tipo: 'entrada', quantidade: 1, observacoes: '', projeto_id: '',
    });
    setShowModal(true);
  };

  // Função para lidar com mudanças no formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' && (name === 'produto_id' || name === 'projeto_id') ? null : value,
    }));
  };

  // Função para salvar nova movimentação
  const handleSaveMovimentacao = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    // Preparar dados
    const dataToSave = {
      ...formData,
      quantidade: parseInt(formData.quantidade, 10),
      produto_id: parseInt(formData.produto_id, 10),
      projeto_id: formData.projeto_id ? parseInt(formData.projeto_id, 10) : null,
    };

    // Validar campos
    if (isNaN(dataToSave.produto_id)) {
      setModalError('Selecione um produto válido.');
      setModalLoading(false);
      return;
    }
    if (isNaN(dataToSave.quantidade) || dataToSave.quantidade <= 0) {
      setModalError('A quantidade deve ser um número maior que zero.');
      setModalLoading(false);
      return;
    }

    try {
      await api.post('/movimentacoes/', dataToSave);
      toast.success('Movimentação registrada com sucesso!');
      handleCloseModal();
      fetchMovimentacoes(); // Atualizar a lista
      // Opcional: Atualizar lista de produtos se quiser mostrar estoque atualizado imediatamente
      // fetchProdutos(); 
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao registrar movimentação.';
      setModalError(errorMsg);
      toast.error(`Erro ao registrar movimentação: ${errorMsg}`);
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // Função para formatar data
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('pt-BR');
    } catch (e) {
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
        <Col md={2} sm={6} className="mb-2">
          <Form.Group controlId="filtroDataInicio">
            <Form.Label>Data Início</Form.Label>
            <InputGroup>
              <FormControl type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={2} sm={6} className="mb-2">
          <Form.Group controlId="filtroDataFim">
            <Form.Label>Data Fim</Form.Label>
            <InputGroup>
              <FormControl type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3} sm={12} className="mb-2">
          <Form.Group controlId="filtroProjeto">
            <Form.Label>Projeto</Form.Label>
            <Form.Select value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}>
              <option value="">Todos</option>
              {projetos.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.nome}</option>
              ))}
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
              <th>Projeto</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">Nenhuma movimentação encontrada para os filtros selecionados.</td>
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
                  <td>{/* Placeholder: Buscar nome do usuário pelo mov.usuario_id */} ID: {mov.usuario_id}</td>
                  <td>{mov.projeto_id ? (projetos.find(p => p.id === mov.projeto_id)?.nome || 'N/A') : '-'}</td>
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
              <Form.Select name="produto_id" value={formData.produto_id} onChange={handleFormChange} required>
                <option value="">Selecione o produto...</option>
                {produtos.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.nome} ({prod.codigo_sku}) - Estoque: {prod.quantidade}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMovTipo">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select name="tipo" value={formData.tipo} onChange={handleFormChange} required>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMovQuantidade">
                  <Form.Label>Quantidade</Form.Label>
                  <Form.Control type="number" min="1" name="quantidade" value={formData.quantidade} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="formMovProjeto">
              <Form.Label>Projeto Associado (Opcional)</Form.Label>
              <Form.Select name="projeto_id" value={formData.projeto_id} onChange={handleFormChange}>
                <option value="">Nenhum</option>
                {projetos.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formMovObservacoes">
              <Form.Label>Observações (Opcional)</Form.Label>
              <Form.Control as="textarea" rows={3} name="observacoes" value={formData.observacoes} onChange={handleFormChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Registrando...</>
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
