import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState(null); // Para edição
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    codigo_sku: '',
    descricao: '',
    categoria_id: '',
    unidade_medida: '',
    preco_custo: 0,
    preco_venda: 0,
    quantidade_minima: 0,
    quantidade_maxima: '',
    imagem_url: '',
  });

  // Estado dos filtros
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Função para buscar produtos com filtros
  const fetchProdutos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroCategoria) params.categoria_id = filtroCategoria;
      if (filtroBusca) params.search = filtroBusca;
      
      const response = await api.get('/produtos/', { params });
      setProdutos(response.data);
    } catch (err) {
      setError('Erro ao buscar produtos.');
      toast.error('Erro ao buscar produtos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar categorias
  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias/');
      setCategorias(response.data);
    } catch (err) {
      toast.error('Erro ao buscar categorias para o filtro/formulário.');
      console.error(err);
    }
  };

  // Buscar dados ao montar o componente e quando filtros mudam
  useEffect(() => {
    fetchCategorias();
    fetchProdutos();
  }, [filtroCategoria, filtroBusca]);

  // Funções para controlar o modal
  const handleCloseModal = () => {
    setShowModal(false);
    setProdutoAtual(null);
    setModalError(null);
    // Resetar formulário
    setFormData({
      nome: '', codigo_sku: '', descricao: '', categoria_id: '', unidade_medida: '',
      preco_custo: 0, preco_venda: 0, quantidade_minima: 0, quantidade_maxima: '', imagem_url: '',
    });
  };

  const handleShowCreateModal = () => {
    setProdutoAtual(null);
    // Resetar formulário
    setFormData({
      nome: '', codigo_sku: '', descricao: '', categoria_id: '', unidade_medida: '',
      preco_custo: 0, preco_venda: 0, quantidade_minima: 0, quantidade_maxima: '', imagem_url: '',
    });
    setShowModal(true);
  };

  const handleShowEditModal = (produto) => {
    setProdutoAtual(produto);
    setFormData({
      nome: produto.nome,
      codigo_sku: produto.codigo_sku,
      descricao: produto.descricao || '',
      categoria_id: produto.categoria_id,
      unidade_medida: produto.unidade_medida,
      preco_custo: produto.preco_custo,
      preco_venda: produto.preco_venda,
      quantidade_minima: produto.quantidade_minima,
      quantidade_maxima: produto.quantidade_maxima === null ? '' : produto.quantidade_maxima,
      imagem_url: produto.imagem_url || '',
    });
    setShowModal(true);
  };

  // Função para lidar com mudanças no formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' && (name === 'quantidade_maxima' || name === 'categoria_id') ? null : value,
    }));
  };

  // Função para salvar (criar ou atualizar) produto
  const handleSaveProduto = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    
    // Preparar dados, convertendo strings vazias para null onde necessário
    const dataToSave = {
        ...formData,
        quantidade_maxima: formData.quantidade_maxima === '' ? null : parseInt(formData.quantidade_maxima, 10),
        preco_custo: parseFloat(formData.preco_custo),
        preco_venda: parseFloat(formData.preco_venda),
        quantidade_minima: parseInt(formData.quantidade_minima, 10),
        categoria_id: parseInt(formData.categoria_id, 10),
    };

    // Validar se categoria_id é um número válido
    if (isNaN(dataToSave.categoria_id)) {
        setModalError('Selecione uma categoria válida.');
        setModalLoading(false);
        return;
    }

    try {
      if (produtoAtual) {
        // Atualizar produto
        await api.put(`/produtos/${produtoAtual.id}`, dataToSave);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await api.post('/produtos/', dataToSave);
        toast.success('Produto criado com sucesso!');
      }
      handleCloseModal();
      fetchProdutos(); // Atualizar a lista
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao salvar produto.';
      setModalError(errorMsg);
      toast.error(`Erro ao salvar produto: ${errorMsg}`);
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  // Função para excluir produto
  const handleDeleteProduto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        toast.success('Produto excluído com sucesso!');
        fetchProdutos(); // Atualizar a lista
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Erro ao excluir produto.';
        toast.error(`Erro ao excluir produto: ${errorMsg}`);
        console.error(err);
      }
    }
  };

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Gerenciamento de Produtos</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="filtroCategoria">
            <Form.Label>Filtrar por Categoria</Form.Label>
            <Form.Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group controlId="filtroBusca">
            <Form.Label>Buscar por Nome, SKU ou Descrição</Form.Label>
            <InputGroup>
              <FormControl 
                type="text" 
                placeholder="Digite para buscar..." 
                value={filtroBusca} 
                onChange={(e) => setFiltroBusca(e.target.value)} 
              />
              <Button variant="outline-secondary"><FaSearch /></Button>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button variant="primary" onClick={handleShowCreateModal} className="w-100">
            <FaPlus className="me-1" /> Novo Produto
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando produtos...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Qtd.</th>
              <th>Un.</th>
              <th>Preço Venda</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">Nenhum produto encontrado.</td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.codigo_sku}</td>
                  <td>{produto.nome}</td>
                  <td>{categorias.find(cat => cat.id === produto.categoria_id)?.nome || 'N/A'}</td>
                  <td>{produto.quantidade}</td>
                  <td>{produto.unidade_medida}</td>
                  <td>R$ {parseFloat(produto.preco_venda).toFixed(2)}</td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => handleShowEditModal(produto)} className="me-2">
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteProduto(produto.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para Criar/Editar Produto */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{produtoAtual ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduto}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="formProdutoNome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formProdutoSku">
                  <Form.Label>Código SKU</Form.Label>
                  <Form.Control type="text" name="codigo_sku" value={formData.codigo_sku} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="formProdutoDescricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={2} name="descricao" value={formData.descricao} onChange={handleFormChange} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoCategoria">
                  <Form.Label>Categoria</Form.Label>
                  <Form.Select name="categoria_id" value={formData.categoria_id} onChange={handleFormChange} required>
                    <option value="">Selecione...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoUnidade">
                  <Form.Label>Unidade de Medida</Form.Label>
                  <Form.Control type="text" name="unidade_medida" value={formData.unidade_medida} onChange={handleFormChange} required placeholder="Ex: un, kg, L, m"/>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoCusto">
                  <Form.Label>Preço de Custo (R$)</Form.Label>
                  <Form.Control type="number" step="0.01" min="0" name="preco_custo" value={formData.preco_custo} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoVenda">
                  <Form.Label>Preço de Venda (R$)</Form.Label>
                  <Form.Control type="number" step="0.01" min="0" name="preco_venda" value={formData.preco_venda} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoQtdMin">
                  <Form.Label>Quantidade Mínima</Form.Label>
                  <Form.Control type="number" min="0" name="quantidade_minima" value={formData.quantidade_minima} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProdutoQtdMax">
                  <Form.Label>Quantidade Máxima (Opcional)</Form.Label>
                  <Form.Control type="number" min="0" name="quantidade_maxima" value={formData.quantidade_maxima} onChange={handleFormChange} placeholder="Deixe em branco se não houver"/>
                </Form.Group>
              </Col>
            </Row>
             <Form.Group className="mb-3" controlId="formProdutoImagemUrl">
              <Form.Label>URL da Imagem (Opcional)</Form.Label>
              <Form.Control type="text" name="imagem_url" value={formData.imagem_url} onChange={handleFormChange} placeholder="https://exemplo.com/imagem.jpg"/>
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

export default Produtos;
