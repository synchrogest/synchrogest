import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Row, Col, InputGroup, FormControl, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const fetchVendas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/compras/');
      setVendas(response.data);
    } catch (err) {
      setError('Erro ao buscar vendas.');
      toast.error('Erro ao buscar vendas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  return (
    <Container fluid>
      <h1 className="h3 mb-3">Histórico de Vendas</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
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
        <Col md={6}>
          <Form.Group controlId="filtroData">
            <Form.Label>Filtrar por Data</Form.Label>
            <InputGroup>
              <FormControl
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={fetchVendas}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando vendas...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Nenhuma venda encontrada.</td>
              </tr>
            ) : (
              vendas.map((venda) => (
                <tr key={venda.id}>
                  <td>{venda.id}</td>
                  <td>{venda.nome_cliente || venda.cliente_id}</td>
                  <td>{formatarData(venda.data_compra)}</td>
                  <td>R$ {parseFloat(venda.valor_total).toFixed(2)}</td>
                  <td><span className="badge bg-success">Finalizada</span></td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Vendas;
