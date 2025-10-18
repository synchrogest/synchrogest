import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, FormControl, Card, ListGroup, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaCalendarAlt, FaUsers, FaBoxOpen, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Projetos = () => {
  const [projetos, setProjetos] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Para dropdown de responsável
  const [produtos, setProdutos] = useState([]); // Para adicionar produtos ao projeto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado do Modal Principal (Criar/Editar Projeto)
  const [showProjetoModal, setShowProjetoModal] = useState(false);
  const [projetoAtual, setProjetoAtual] = useState(null); // Para edição
  const [projetoModalLoading, setProjetoModalLoading] = useState(false);
  const [projetoModalError, setProjetoModalError] = useState(null);
  const [projetoFormData, setProjetoFormData] = useState({
    nome: '',
    local: '',
    data_inicio: '',
    data_fim: '',
    responsavel_id: '',
    status: 'planejamento',
    descricao: '',
  });

  // Estado do Modal de Detalhes
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [projetoDetalhes, setProjetoDetalhes] = useState(null);
  const [detalhesLoading, setDetalhesLoading] = useState(false);
  const [detalhesError, setDetalhesError] = useState(null);

  // Estado do Modal de Adicionar Colaborador
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [colaboradorModalLoading, setColaboradorModalLoading] = useState(false);
  const [colaboradorModalError, setColaboradorModalError] = useState(null);
  const [colaboradorId, setColaboradorId] = useState('');

  // Estado do Modal de Adicionar Produto
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtoModalLoading, setProdutoModalLoading] = useState(false);
  const [produtoModalError, setProdutoModalError] = useState(null);
  const [produtoId, setProdutoId] = useState('');
  const [produtoQuantidade, setProdutoQuantidade] = useState(1);
  const [produtoObservacao, setProdutoObservacao] = useState('');

  // Estado dos filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // --- Funções de Busca --- 
  const fetchProjetos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroStatus) params.status = filtroStatus;
      if (filtroResponsavel) params.responsavel_id = filtroResponsavel;
      if (filtroDataInicio) params.data_inicio = filtroDataInicio;
      if (filtroDataFim) params.data_fim = filtroDataFim;

      const response = await api.get('/projetos/', { params });
      setProjetos(response.data);
    } catch (err) {
      setError('Erro ao buscar projetos.');
      toast.error('Erro ao buscar projetos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios/', { params: { limit: 1000 } });
      setUsuarios(response.data);
    } catch (err) {
      toast.error('Erro ao buscar usuários.');
      console.error(err);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos/', { params: { limit: 1000 } });
      setProdutos(response.data);
    } catch (err) {
      toast.error('Erro ao buscar produtos.');
      console.error(err);
    }
  };

  const fetchProjetoDetalhes = async (id) => {
    setDetalhesLoading(true);
    setDetalhesError(null);
    try {
      const response = await api.get(`/projetos/${id}`);
      // Mapear colaboradores para incluir nome
      const colaboradoresComNome = response.data.colaboradores.map(colab => {
        const usuario = usuarios.find(u => u.id === colab.usuario_id);
        return { ...colab, nome: usuario ? usuario.nome : 'Usuário não encontrado' };
      });
      // Mapear produtos para incluir nome
      const produtosComNome = response.data.produtos.map(prodProj => {
        const produto = produtos.find(p => p.id === prodProj.produto_id);
        return { ...prodProj, nome: produto ? produto.nome : 'Produto não encontrado' };
      });
      setProjetoDetalhes({ ...response.data, colaboradores: colaboradoresComNome, produtos: produtosComNome });
    } catch (err) {
      setDetalhesError('Erro ao buscar detalhes do projeto.');
      toast.error('Erro ao buscar detalhes do projeto.');
      console.error(err);
    } finally {
      setDetalhesLoading(false);
    }
  };

  // Buscar dados ao montar e quando filtros mudam
  useEffect(() => {
    fetchUsuarios();
    fetchProdutos();
    fetchProjetos();
  }, [filtroStatus, filtroResponsavel, filtroDataInicio, filtroDataFim]);

  // --- Funções do Modal Principal (Projeto) --- 
  const handleCloseProjetoModal = () => {
    setShowProjetoModal(false);
    setProjetoAtual(null);
    setProjetoModalError(null);
    setProjetoFormData({ nome: '', local: '', data_inicio: '', data_fim: '', responsavel_id: '', status: 'planejamento', descricao: '' });
  };

  const handleShowCreateProjetoModal = () => {
    setProjetoAtual(null);
    setProjetoFormData({ nome: '', local: '', data_inicio: '', data_fim: '', responsavel_id: '', status: 'planejamento', descricao: '' });
    setShowProjetoModal(true);
  };

  const handleShowEditProjetoModal = (projeto) => {
    setProjetoAtual(projeto);
    setProjetoFormData({
      nome: projeto.nome,
      local: projeto.local || '',
      data_inicio: projeto.data_inicio,
      data_fim: projeto.data_fim || '',
      responsavel_id: projeto.responsavel_id,
      status: projeto.status,
      descricao: projeto.descricao || '',
    });
    setShowProjetoModal(true);
  };

  const handleProjetoFormChange = (e) => {
    const { name, value } = e.target;
    setProjetoFormData(prev => ({
      ...prev,
      [name]: value === '' && (name === 'responsavel_id' || name === 'data_fim' || name === 'local' || name === 'descricao') ? null : value,
    }));
  };

  const handleSaveProjeto = async (e) => {
    e.preventDefault();
    setProjetoModalLoading(true);
    setProjetoModalError(null);

    const dataToSave = {
      ...projetoFormData,
      responsavel_id: parseInt(projetoFormData.responsavel_id, 10),
      data_fim: projetoFormData.data_fim || null, // Garante null se vazio
    };

    if (isNaN(dataToSave.responsavel_id)) {
      setProjetoModalError('Selecione um responsável válido.');
      setProjetoModalLoading(false);
      return;
    }
    if (!dataToSave.data_inicio) {
      setProjetoModalError('Data de início é obrigatória.');
      setProjetoModalLoading(false);
      return;
    }

    try {
      if (projetoAtual) {
        await api.put(`/projetos/${projetoAtual.id}`, dataToSave);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        await api.post('/projetos/', dataToSave);
        toast.success('Projeto criado com sucesso!');
      }
      handleCloseProjetoModal();
      fetchProjetos();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao salvar projeto.';
      setProjetoModalError(errorMsg);
      toast.error(`Erro ao salvar projeto: ${errorMsg}`);
      console.error(err);
    } finally {
      setProjetoModalLoading(false);
    }
  };

  const handleDeleteProjeto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/projetos/${id}`);
        toast.success('Projeto excluído com sucesso!');
        fetchProjetos();
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Erro ao excluir projeto.';
        toast.error(`Erro ao excluir projeto: ${errorMsg}`);
        console.error(err);
      }
    }
  };

  // --- Funções do Modal de Detalhes --- 
  const handleShowDetalhesModal = (projeto) => {
    setProjetoDetalhes(null); // Limpa detalhes anteriores
    setShowDetalhesModal(true);
    fetchProjetoDetalhes(projeto.id);
  };

  const handleCloseDetalhesModal = () => {
    setShowDetalhesModal(false);
    setProjetoDetalhes(null);
  };

  // --- Funções do Modal de Colaborador --- 
  const handleShowColaboradorModal = () => {
    setColaboradorId('');
    setColaboradorModalError(null);
    setShowColaboradorModal(true);
  };

  const handleCloseColaboradorModal = () => {
    setShowColaboradorModal(false);
  };

  const handleAddColaborador = async (e) => {
    e.preventDefault();
    if (!colaboradorId || !projetoDetalhes) return;
    setColaboradorModalLoading(true);
    setColaboradorModalError(null);
    try {
      await api.post(`/projetos/${projetoDetalhes.id}/colaboradores`, { usuario_id: parseInt(colaboradorId, 10) });
      toast.success('Colaborador adicionado com sucesso!');
      fetchProjetoDetalhes(projetoDetalhes.id); // Atualiza detalhes
      handleCloseColaboradorModal();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao adicionar colaborador.';
      setColaboradorModalError(errorMsg);
      toast.error(`Erro: ${errorMsg}`);
      console.error(err);
    } finally {
      setColaboradorModalLoading(false);
    }
  };

  const handleRemoveColaborador = async (usuarioId) => {
    if (!projetoDetalhes) return;
    if (window.confirm('Tem certeza que deseja remover este colaborador do projeto?')) {
      try {
        await api.delete(`/projetos/${projetoDetalhes.id}/colaboradores/${usuarioId}`);
        toast.success('Colaborador removido com sucesso!');
        fetchProjetoDetalhes(projetoDetalhes.id); // Atualiza detalhes
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Erro ao remover colaborador.';
        toast.error(`Erro: ${errorMsg}`);
        console.error(err);
      }
    }
  };

  // --- Funções do Modal de Produto --- 
  const handleShowProdutoModal = () => {
    setProdutoId('');
    setProdutoQuantidade(1);
    setProdutoObservacao('');
    setProdutoModalError(null);
    setShowProdutoModal(true);
  };

  const handleCloseProdutoModal = () => {
    setShowProdutoModal(false);
  };

  const handleAddProduto = async (e) => {
    e.preventDefault();
    if (!produtoId || !projetoDetalhes) return;
    setProdutoModalLoading(true);
    setProdutoModalError(null);
    try {
      await api.post(`/projetos/${projetoDetalhes.id}/produtos`, {
        produto_id: parseInt(produtoId, 10),
        quantidade: parseInt(produtoQuantidade, 10),
        observacao: produtoObservacao
      });
      toast.success('Produto adicionado ao projeto com sucesso!');
      fetchProjetoDetalhes(projetoDetalhes.id); // Atualiza detalhes
      handleCloseProdutoModal();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao adicionar produto ao projeto.';
      setProdutoModalError(errorMsg);
      toast.error(`Erro: ${errorMsg}`);
      console.error(err);
    } finally {
      setProdutoModalLoading(false);
    }
  };

  const handleRemoveProduto = async (produtoId) => {
    if (!projetoDetalhes) return;
    if (window.confirm('Tem certeza que deseja remover este produto do projeto?')) {
      try {
        await api.delete(`/projetos/${projetoDetalhes.id}/produtos/${produtoId}`);
        toast.success('Produto removido do projeto com sucesso!');
        fetchProjetoDetalhes(projetoDetalhes.id); // Atualiza detalhes
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Erro ao remover produto do projeto.';
        toast.error(`Erro: ${errorMsg}`);
        console.error(err);
      }
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Gerenciamento de Projetos</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filtros */}
      <Row className="mb-3 p-3 border rounded bg-light mx-1">
        <Col md={12} className="mb-2"><FaFilter className="me-1" /> Filtros:</Col>
        <Col md={3} sm={6} className="mb-2">
          <Form.Group controlId="filtroStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="planejamento">Planejamento</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} sm={6} className="mb-2">
          <Form.Group controlId="filtroResponsavel">
            <Form.Label>Responsável</Form.Label>
            <Form.Select value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)}>
              <option value="">Todos</option>
              {usuarios.map(user => (
                <option key={user.id} value={user.id}>{user.nome}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} sm={6} className="mb-2">
          <Form.Group controlId="filtroDataInicio">
            <Form.Label>Data Início (a partir de)</Form.Label>
            <InputGroup>
              <FormControl type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3} sm={6} className="mb-2">
          <Form.Group controlId="filtroDataFim">
            <Form.Label>Data Fim (até)</Form.Label>
            <InputGroup>
              <FormControl type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      <Button variant="primary" onClick={handleShowCreateProjetoModal} className="mb-3">
        <FaPlus className="me-1" /> Novo Projeto
      </Button>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando projetos...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">Nenhum projeto encontrado.</td>
              </tr>
            ) : (
              projetos.map((projeto) => (
                <tr key={projeto.id}>
                  <td>{projeto.id}</td>
                  <td>{projeto.nome}</td>
                  <td>{usuarios.find(u => u.id === projeto.responsavel_id)?.nome || 'N/A'}</td>
                  <td><Badge bg={projeto.status === 'concluido' ? 'success' : projeto.status === 'cancelado' ? 'danger' : 'primary'}>{projeto.status}</Badge></td>
                  <td>{formatDate(projeto.data_inicio)}</td>
                  <td>{formatDate(projeto.data_fim)}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => handleShowDetalhesModal(projeto)} className="me-2" title="Ver Detalhes">
                      <FaEye />
                    </Button>
                    <Button variant="warning" size="sm" onClick={() => handleShowEditProjetoModal(projeto)} className="me-2" title="Editar Projeto">
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteProjeto(projeto.id)} title="Excluir Projeto">
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para Criar/Editar Projeto */}
      <Modal show={showProjetoModal} onHide={handleCloseProjetoModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{projetoAtual ? 'Editar Projeto' : 'Novo Projeto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProjeto}>
          <Modal.Body>
            {projetoModalError && <Alert variant="danger">{projetoModalError}</Alert>}
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="formProjetoNome">
                  <Form.Label>Nome do Projeto</Form.Label>
                  <Form.Control type="text" name="nome" value={projetoFormData.nome} onChange={handleProjetoFormChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProjetoLocal">
                  <Form.Label>Local (Opcional)</Form.Label>
                  <Form.Control type="text" name="local" value={projetoFormData.local} onChange={handleProjetoFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProjetoResponsavel">
                  <Form.Label>Responsável</Form.Label>
                  <Form.Select name="responsavel_id" value={projetoFormData.responsavel_id} onChange={handleProjetoFormChange} required>
                    <option value="">Selecione...</option>
                    {usuarios.map(user => (
                      <option key={user.id} value={user.id}>{user.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formProjetoDataInicio">
                  <Form.Label>Data Início</Form.Label>
                  <Form.Control type="date" name="data_inicio" value={projetoFormData.data_inicio} onChange={handleProjetoFormChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formProjetoDataFim">
                  <Form.Label>Data Fim (Opcional)</Form.Label>
                  <Form.Control type="date" name="data_fim" value={projetoFormData.data_fim} onChange={handleProjetoFormChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formProjetoStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={projetoFormData.status} onChange={handleProjetoFormChange} required>
                    <option value="planejamento">Planejamento</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="formProjetoDescricao">
              <Form.Label>Descrição (Opcional)</Form.Label>
              <Form.Control as="textarea" rows={3} name="descricao" value={projetoFormData.descricao} onChange={handleProjetoFormChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseProjetoModal} disabled={projetoModalLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={projetoModalLoading}>
              {projetoModalLoading ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</>
              ) : (
                'Salvar Projeto'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Detalhes do Projeto */}
      <Modal show={showDetalhesModal} onHide={handleCloseDetalhesModal} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Projeto: {projetoDetalhes?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detalhesLoading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : detalhesError ? (
            <Alert variant="danger">{detalhesError}</Alert>
          ) : projetoDetalhes ? (
            <Row>
              {/* Informações Gerais */}
              <Col md={12} className="mb-3">
                <Card>
                  <Card.Header>Informações Gerais</Card.Header>
                  <Card.Body>
                    <p><strong>ID:</strong> {projetoDetalhes.id}</p>
                    <p><strong>Local:</strong> {projetoDetalhes.local || 'N/A'}</p>
                    <p><strong>Responsável:</strong> {usuarios.find(u => u.id === projetoDetalhes.responsavel_id)?.nome || 'N/A'}</p>
                    <p><strong>Status:</strong> <Badge bg={projetoDetalhes.status === 'concluido' ? 'success' : projetoDetalhes.status === 'cancelado' ? 'danger' : 'primary'}>{projetoDetalhes.status}</Badge></p>
                    <p><strong>Data Início:</strong> {formatDate(projetoDetalhes.data_inicio)}</p>
                    <p><strong>Data Fim:</strong> {formatDate(projetoDetalhes.data_fim)}</p>
                    <p><strong>Descrição:</strong> {projetoDetalhes.descricao || 'N/A'}</p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Colaboradores */}
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span><FaUsers className="me-1" /> Colaboradores</span>
                    <Button variant="outline-primary" size="sm" onClick={handleShowColaboradorModal}><FaPlus /> Adicionar</Button>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {projetoDetalhes.colaboradores.length === 0 ? (
                      <ListGroup.Item>Nenhum colaborador associado.</ListGroup.Item>
                    ) : (
                      projetoDetalhes.colaboradores.map(colab => (
                        <ListGroup.Item key={colab.id} className="d-flex justify-content-between align-items-center">
                          {colab.nome} (ID: {colab.usuario_id})
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveColaborador(colab.usuario_id)}><FaTrash /></Button>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card>
              </Col>

              {/* Produtos */}
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span><FaBoxOpen className="me-1" /> Produtos</span>
                    <Button variant="outline-primary" size="sm" onClick={handleShowProdutoModal}><FaPlus /> Adicionar</Button>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {projetoDetalhes.produtos.length === 0 ? (
                      <ListGroup.Item>Nenhum produto associado.</ListGroup.Item>
                    ) : (
                      projetoDetalhes.produtos.map(prodProj => (
                        <ListGroup.Item key={prodProj.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            {prodProj.nome} (ID: {prodProj.produto_id}) <br />
                            <small>Qtd: {prodProj.quantidade} {produtos.find(p => p.id === prodProj.produto_id)?.unidade_medida || ''}</small><br />
                            {prodProj.observacao && <small>Obs: {prodProj.observacao}</small>}
                          </div>
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveProduto(prodProj.produto_id)}><FaTrash /></Button>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          ) : (
            <p>Nenhum detalhe para exibir.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetalhesModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Adicionar Colaborador */}
      <Modal show={showColaboradorModal} onHide={handleCloseColaboradorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Colaborador ao Projeto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddColaborador}>
          <Modal.Body>
            {colaboradorModalError && <Alert variant="danger">{colaboradorModalError}</Alert>}
            <Form.Group className="mb-3" controlId="formAddColaborador">
              <Form.Label>Selecione o Usuário</Form.Label>
              <Form.Select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} required>
                <option value="">Selecione...</option>
                {usuarios
                  .filter(user => !projetoDetalhes?.colaboradores.some(c => c.usuario_id === user.id)) // Filtra quem já está no projeto
                  .map(user => (
                    <option key={user.id} value={user.id}>{user.nome} ({user.email})</option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseColaboradorModal} disabled={colaboradorModalLoading}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={colaboradorModalLoading}>
              {colaboradorModalLoading ? <Spinner size="sm" /> : 'Adicionar Colaborador'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Adicionar Produto */}
      <Modal show={showProdutoModal} onHide={handleCloseProdutoModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Produto ao Projeto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddProduto}>
          <Modal.Body>
            {produtoModalError && <Alert variant="danger">{produtoModalError}</Alert>}
            <Form.Group className="mb-3" controlId="formAddProdutoId">
              <Form.Label>Selecione o Produto</Form.Label>
              <Form.Select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
                <option value="">Selecione...</option>
                {produtos
                  .filter(prod => !projetoDetalhes?.produtos.some(p => p.produto_id === prod.id)) // Filtra quem já está no projeto
                  .map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.nome} ({prod.codigo_sku})</option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAddProdutoQtd">
              <Form.Label>Quantidade</Form.Label>
              <Form.Control type="number" min="1" value={produtoQuantidade} onChange={(e) => setProdutoQuantidade(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAddProdutoObs">
              <Form.Label>Observação (Opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={produtoObservacao} onChange={(e) => setProdutoObservacao(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseProdutoModal} disabled={produtoModalLoading}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={produtoModalLoading}>
              {produtoModalLoading ? <Spinner size="sm" /> : 'Adicionar Produto'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default Projetos;

