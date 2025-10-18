import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Button, Modal } from 'react-bootstrap';
import api from '../../services/api';
import { FaBoxOpen, FaExclamationTriangle, FaProjectDiagram, FaHistory, FaInfoCircle } from 'react-icons/fa';

const Dashboard = () => {
  const [produtosTotal, setProdutosTotal] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [projetosAtivos, setProjetosAtivos] = useState([]);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para controlar os modais
  const [showProdutosModal, setShowProdutosModal] = useState(false);
  const [showEstoqueBaixoModal, setShowEstoqueBaixoModal] = useState(false);
  const [showProjetosModal, setShowProjetosModal] = useState(false);
  
  // Funções para abrir/fechar modais
  const handleCloseProdutos = () => setShowProdutosModal(false);
  // const handleShowProdutos = () => setShowProdutosModal(true);
  
  const handleCloseEstoqueBaixo = () => setShowEstoqueBaixoModal(false);
  const handleShowEstoqueBaixo = () => setShowEstoqueBaixoModal(true);
  
  const handleCloseProjetos = () => setShowProjetosModal(false);
  const handleShowProjetos = () => setShowProjetosModal(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Buscar todos os produtos para contar o total
        const resProdutos = await api.get('/produtos/');
        setProdutosTotal(resProdutos.data.length);
        
        // Buscar produtos com estoque baixo
        const resEstoqueBaixo = await api.get('/produtos/');
        // Filtrar produtos com estoque baixo (quantidade < quantidade_minima)
        const produtosBaixoEstoque = resEstoqueBaixo.data.filter(
          produto => produto.quantidade < produto.quantidade_minima
        );
        setProdutosEstoqueBaixo(produtosBaixoEstoque);
        
        // Buscar projetos ativos (status = "em_andamento")
        const resProjetos = await api.get('/projetos/');
        // Filtrar projetos com status "em_andamento"
        const projetosEmAndamento = resProjetos.data.filter(
          projeto => projeto.status === 'em_andamento'
        );
        setProjetosAtivos(projetosEmAndamento);
        
        // Buscar últimas movimentações (limitado a 5)
        const resMovimentacoes = await api.get('/movimentacoes/');
        // Ordenar por data (mais recente primeiro) e pegar as 5 primeiras
        const movimentacoesOrdenadas = [...resMovimentacoes.data]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 5);
        setUltimasMovimentacoes(movimentacoesOrdenadas);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError('Erro ao carregar dados do dashboard. Verifique o console para mais detalhes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Container fluid className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando dados do Dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Dashboard</h1>
      <Row>
        <Col md={6} xl={3} className="mb-3">
          <Card className="h-100">
          {/* <Card className="h-100 dashboard-card" onClick={handleShowProdutos} style={{ cursor: 'pointer' }}> */}
            <Card.Body>
              <Row>
                <Col xs={8}>
                  <Card.Title className="text-muted mb-2">Produtos Cadastrados</Card.Title>
                  <h4 className="mb-0">{produtosTotal}</h4>
                </Col>
                <Col xs={4} className="text-end">
                  <FaBoxOpen size={28} className="text-primary" />
                </Col>
              </Row>
              {/* <Row className="mt-3">
                <Col>
                  <Button variant="outline-primary" size="sm" className="w-100">
                    <FaInfoCircle className="me-1" /> Ver Detalhes
                  </Button>
                </Col>
              </Row> */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Card className="h-100 dashboard-card" onClick={handleShowEstoqueBaixo} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <Row>
                <Col xs={8}>
                  <Card.Title className="text-muted mb-2">Estoque Baixo</Card.Title>
                  <h4 className="mb-0">{produtosEstoqueBaixo.length}</h4>
                </Col>
                <Col xs={4} className="text-end">
                  <FaExclamationTriangle size={28} className="text-danger" />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <Button variant="outline-danger" size="sm" className="w-100">
                    <FaInfoCircle className="me-1" /> Ver Detalhes
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Card className="h-100 dashboard-card" onClick={handleShowProjetos} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <Row>
                <Col xs={8}>
                  <Card.Title className="text-muted mb-2">Projetos Ativos</Card.Title>
                  <h4 className="mb-0">{projetosAtivos.length}</h4>
                </Col>
                <Col xs={4} className="text-end">
                  <FaProjectDiagram size={28} className="text-success" />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <Button variant="outline-success" size="sm" className="w-100">
                    <FaInfoCircle className="me-1" /> Ver Detalhes
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Row>
                <Col xs={8}>
                  <Card.Title className="text-muted mb-2">Movimentações</Card.Title>
                  <h4 className="mb-0">Últimas {ultimasMovimentacoes.length}</h4>
                </Col>
                <Col xs={4} className="text-end">
                  <FaHistory size={28} className="text-info" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Seção de Movimentações (sempre visível) */}
      <Row>
        <Col md={12} className="mt-3">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Últimas Movimentações Registradas</Card.Title>
            </Card.Header>
            <ListGroup variant="flush">
              {ultimasMovimentacoes.length > 0 ? (
                ultimasMovimentacoes.map(mov => (
                  <ListGroup.Item key={mov.id}>
                    <Row>
                      <Col md={3}><strong>Data:</strong> {formatarData(mov.data)}</Col>
                      <Col md={3}><strong>Produto ID:</strong> {mov.produto_id}</Col>
                      <Col md={2}><strong>Tipo:</strong> <span className={`text-capitalize badge bg-${mov.tipo === 'entrada' ? 'success' : 'danger'}`}>{mov.tipo}</span></Col>
                      <Col md={2}><strong>Qtd:</strong> {mov.quantidade}</Col>
                      <Col md={2}><strong>Usuário ID:</strong> {mov.usuario_id}</Col>
                    </Row>
                    {mov.observacoes && <small className="text-muted">Obs: {mov.observacoes}</small>}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>Nenhuma movimentação recente.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
      
      {/* Modal de Produtos Cadastrados */}
{/* Modal de Produtos Cadastrados */}
<Modal show={showProdutosModal} onHide={handleCloseProdutos}>
  {/* <Modal.Header closeButton>
    <Modal.Title>
      <FaBoxOpen className="me-2 text-primary" />
      Produtos Cadastrados
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="text-center">
    <h2 className="display-4">{produtosTotal}</h2>
    <p className="lead">Total de produtos no sistema</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseProdutos}>
      Fechar
    </Button>
  </Modal.Footer> */}
</Modal>

      {/* <Modal show={showProdutosModal} onHide={handleCloseProdutos} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBoxOpen className="me-2 text-primary" />
            Produtos Cadastrados
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Total de produtos cadastrados: <strong>{produtosTotal}</strong></p>
          <ListGroup>
            {produtosTotal > 0 ? (
              <ListGroup.Item>
                <Row className="fw-bold">
                  <Col md={1}>ID</Col>
                  <Col md={4}>Nome</Col>
                  <Col md={2}>Preço</Col>
                  <Col md={2}>Quantidade</Col>
                  <Col md={3}>Categoria</Col>
                </Row>
              </ListGroup.Item>
            ) : (
              <ListGroup.Item>Nenhum produto cadastrado.</ListGroup.Item>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProdutos}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal> */}
      
      {/* Modal de Produtos com Estoque Baixo */}
      <Modal show={showEstoqueBaixoModal} onHide={handleCloseEstoqueBaixo} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="me-2 text-danger" />
            Produtos com Estoque Baixo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Total de produtos com estoque baixo: <strong>{produtosEstoqueBaixo.length}</strong></p>
          <ListGroup>
            {produtosEstoqueBaixo.length > 0 ? (
              <>
                <ListGroup.Item>
                  <Row className="fw-bold">
                    <Col md={1}>ID</Col>
                    <Col md={4}>Nome</Col>
                    <Col md={2}>Atual</Col>
                    <Col md={2}>Mínimo</Col>
                    <Col md={3}>Status</Col>
                  </Row>
                </ListGroup.Item>
                {produtosEstoqueBaixo.map(produto => (
                  <ListGroup.Item key={produto.id}>
                    <Row>
                      <Col md={1}>{produto.id}</Col>
                      <Col md={4}>{produto.nome}</Col>
                      <Col md={2}>{produto.quantidade}</Col>
                      <Col md={2}>{produto.quantidade_minima}</Col>
                      <Col md={3}>
                        <span className="badge bg-danger">Estoque Baixo</span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </>
            ) : (
              <ListGroup.Item>Nenhum produto com estoque baixo.</ListGroup.Item>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEstoqueBaixo}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de Projetos Ativos */}
      <Modal show={showProjetosModal} onHide={handleCloseProjetos} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaProjectDiagram className="me-2 text-success" />
            Projetos Ativos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Total de projetos ativos: <strong>{projetosAtivos.length}</strong></p>
          <ListGroup>
            {projetosAtivos.length > 0 ? (
              <>
                <ListGroup.Item>
                  <Row className="fw-bold">
                    <Col md={1}>ID</Col>
                    <Col md={4}>Nome</Col>
                    <Col md={3}>Local</Col>
                    <Col md={2}>Início</Col>
                    <Col md={2}>Status</Col>
                  </Row>
                </ListGroup.Item>
                {projetosAtivos.map(projeto => (
                  <ListGroup.Item key={projeto.id}>
                    <Row>
                      <Col md={1}>{projeto.id}</Col>
                      <Col md={4}>{projeto.nome}</Col>
                      <Col md={3}>{projeto.local || 'N/A'}</Col>
                      <Col md={2}>{formatarData(projeto.data_inicio).split(' ')[0]}</Col>
                      <Col md={2}>
                        <span className="badge bg-success">Em Andamento</span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </>
            ) : (
              <ListGroup.Item>Nenhum projeto ativo.</ListGroup.Item>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProjetos}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
