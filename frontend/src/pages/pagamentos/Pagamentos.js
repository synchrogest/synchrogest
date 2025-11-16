import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Row, Col, InputGroup, FormControl, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const fetchPagamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/pagamentos/');
      setPagamentos(response.data);
    } catch (err) {
      setError('Erro ao buscar pagamentos.');
      toast.error('Erro ao buscar pagamentos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  // Aplica filtros simples em memória
  const pagamentosFiltrados = pagamentos.filter((p) => {
    const clienteMatch = filtroCliente
      ? String(p.cliente_id).includes(filtroCliente) || (p.cliente?.nome || '').toLowerCase().includes(filtroCliente.toLowerCase())
      : true;
    const dataMatch = filtroData ? formatarData(p.data_criacao) === formatarData(filtroData) : true;
    const statusMatch = filtroStatus ? p.status === filtroStatus : true;
    return clienteMatch && dataMatch && statusMatch;
  });

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Histórico de Pagamentos</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="filtroCliente">
            <Form.Label>Filtrar por Cliente</Form.Label>
            <FormControl
              type="text"
              placeholder="Nome ou ID do cliente"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="filtroData">
            <Form.Label>Filtrar por Data</Form.Label>
            <InputGroup>
              <FormControl
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={fetchPagamentos}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="filtroStatus">
            <Form.Label>Filtrar por Status</Form.Label>
            <Form.Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="recusado">Recusado</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando pagamentos...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Compra</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagamentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">Nenhum pagamento encontrado.</td>
              </tr>
            ) : (
              pagamentosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.cliente?.nome || p.cliente_id}</td>
                  <td>{p.compra_id}</td>
                  <td>{formatarData(p.data_criacao)}</td>
                  <td>R$ {parseFloat(p.valor).toFixed(2)}</td>
                  <td>{p.metodo}</td>
                  <td>
                    <span className={`badge bg-${p.status === 'aprovado' ? 'success' : p.status === 'pendente' ? 'warning' : 'danger'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Pagamentos;
