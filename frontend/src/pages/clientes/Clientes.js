import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [filtroBusca, setFiltroBusca] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        endereco: '',
        cep: '',
        cidade: '',
        pais: '',
    });

    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/clientes/');
            setClientes(response.data);
        } catch (err) {
            setError('Erro ao buscar clientes.');
            toast.error('Erro ao buscar clientes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setClienteAtual(null);
        setModalError(null);
        setFormData({
            nome: '',
            email: '',
            senha: '',
            telefone: '',
            endereco: '',
            cep: '',
            cidade: '',
            pais: '',
        });
    };

    const handleShowCreateModal = () => {
        setClienteAtual(null);
        setShowModal(true);
    };

    const handleShowEditModal = (cliente) => {
        setClienteAtual(cliente);
        setFormData({
            nome: cliente.nome,
            email: cliente.email,
            senha: '',
            telefone: cliente.telefone || '',
            endereco: cliente.endereco || '',
            cep: cliente.cep || '',
            cidade: cliente.cidade || '',
            pais: cliente.pais || '',
        });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveCliente = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError(null);

        try {
            if (clienteAtual) {
                await api.put(`/clientes/${clienteAtual.id}`, formData);
                toast.success('Cliente atualizado com sucesso!');
            } else {
                await api.post('/clientes/', formData);
                toast.success('Cliente criado com sucesso!');
            }
            handleCloseModal();
            fetchClientes();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Erro ao salvar cliente.';
            setModalError(errorMsg);
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteCliente = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await api.delete(`/clientes/${id}`);
                toast.success('Cliente excluído com sucesso!');
                fetchClientes();
            } catch (err) {
                const errorMsg = err.response?.data?.detail || 'Erro ao excluir cliente.';
                toast.error(errorMsg);
                console.error(err);
            }
        }
    };

    return (
        <Container fluid>
            <h1 className="h3 mb-3">Gerenciamento de Clientes</h1>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group controlId="filtroBusca">
                        <Form.Label>Buscar por Nome ou Email</Form.Label>
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
                <Col md={6} className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleShowCreateModal} className="w-100">
                        <FaPlus className="me-1" /> Novo Cliente
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Carregando clientes...</p>
                </div>
            ) : (
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Cidade</th>
                            <th>Pais</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">Nenhum cliente encontrado.</td>
                            </tr>
                        ) : (
                            clientes
                                .filter(c => c.nome.toLowerCase().includes(filtroBusca.toLowerCase()) || c.email.toLowerCase().includes(filtroBusca.toLowerCase()))
                                .map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td>{cliente.id}</td>
                                        <td>{cliente.nome}</td>
                                        <td>{cliente.email}</td>
                                        <td>{cliente.telefone || '-'}</td>
                                        <td>{cliente.cidade || '-'}</td>
                                        <td>{cliente.pais || '-'}</td>
                                        <td>
                                            <Button variant="warning" size="sm" onClick={() => handleShowEditModal(cliente)} className="me-2">
                                                <FaEdit />
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteCliente(cliente.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{clienteAtual ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveCliente}>
                    <Modal.Body>
                        {modalError && <Alert variant="danger">{modalError}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control type="text" name="nome" value={formData.nome} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={handleFormChange} required />
                        </Form.Group>
                        {!clienteAtual && (
                            <Form.Group className="mb-3">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control type="password" name="senha" value={formData.senha} onChange={handleFormChange} required />
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Telefone</Form.Label>
                            <Form.Control type="text" name="telefone" value={formData.telefone} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control type="text" name="endereco" value={formData.endereco} onChange={handleFormChange} />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CEP</Form.Label>
                                    <Form.Control type="text" name="cep" value={formData.cep} onChange={handleFormChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cidade</Form.Label>
                                    <Form.Control type="text" name="cidade" value={formData.cidade} onChange={handleFormChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>País</Form.Label>
                            <Form.Control type="text" name="pais" value={formData.pais} onChange={handleFormChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={modalLoading}>
                            {modalLoading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...
                                </>
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

export default Clientes;
