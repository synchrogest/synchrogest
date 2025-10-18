import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Badge, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaUserPlus, FaCalendarAlt, FaListAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../contexts/auth/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Gerenciamento.css'; // Arquivo CSS para estilos personalizados

const Gerenciamento = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gerenciamentos, setGerenciamentos] = useState([]);
  const [gerenciamentoAtual, setGerenciamentoAtual] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para modais
  const [showNovoGerenciamento, setShowNovoGerenciamento] = useState(false);
  const [showNovoItem, setShowNovoItem] = useState(false);
  const [showNovaAcao, setShowNovaAcao] = useState(false);
  const [showPermissoes, setShowPermissoes] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showToggleChecklist, setShowToggleChecklist] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [acaoParaExcluir, setAcaoParaExcluir] = useState(null);
  const [checklistParaToggle, setChecklistParaToggle] = useState(null);
  
  // Estados para formulários
  const [novoGerenciamento, setNovoGerenciamento] = useState({
    titulo: '',
    descricao: '',
    responsavel: '',
    colaboradores: '',
    data_inicio: '',
    data_conclusao: ''
  });
  const [novoItem, setNovoItem] = useState({ nome: '' });
  const [novaAcao, setNovaAcao] = useState({ nome: '' });
  const [novaPermissao, setNovaPermissao] = useState({
    usuario_id: '',
    pode_editar: false
  });

  // Carregar gerenciamentos
  useEffect(() => {
    const fetchGerenciamentos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/gerenciamento');
        setGerenciamentos(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar gerenciamentos:', err);
        setError('Não foi possível carregar os gerenciamentos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchGerenciamentos();
  }, []);

  // Carregar usuários para permissões
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get('/usuarios');
        setUsuarios(response.data);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    };

    fetchUsuarios();
  }, []);

  // Carregar detalhes de um gerenciamento específico
  const carregarGerenciamento = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/gerenciamento/${id}`);
      setGerenciamentoAtual(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhes do gerenciamento:', err);
      setError('Não foi possível carregar os detalhes do gerenciamento.');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo gerenciamento
  const handleCriarGerenciamento = async () => {
    try {
      const response = await api.post('/gerenciamento', novoGerenciamento);
      setGerenciamentos([...gerenciamentos, response.data]);
      setShowNovoGerenciamento(false);
      setNovoGerenciamento({
        titulo: '',
        descricao: '',
        responsavel: '',
        colaboradores: '',
        data_inicio: '',
        data_conclusao: ''
      });
      await carregarGerenciamento(response.data.id);
    } catch (err) {
      console.error('Erro ao criar gerenciamento:', err);
      setError('Não foi possível criar o gerenciamento.');
    }
  };

  // Adicionar novo item
  const handleAdicionarItem = async () => {
    try {
      const response = await api.post(`/gerenciamento/${gerenciamentoAtual.id}/itens`, novoItem);
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowNovoItem(false);
      setNovoItem({ nome: '' });
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setError('Não foi possível adicionar o item.');
    }
  };

  // Adicionar nova ação
  const handleAdicionarAcao = async () => {
    try {
      const response = await api.post(`/gerenciamento/${gerenciamentoAtual.id}/acoes`, novaAcao);
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowNovaAcao(false);
      setNovaAcao({ nome: '' });
    } catch (err) {
      console.error('Erro ao adicionar ação:', err);
      setError('Não foi possível adicionar a ação.');
    }
  };

  // Adicionar permissão
  const handleAdicionarPermissao = async () => {
    try {
      const response = await api.post(`/gerenciamento/${gerenciamentoAtual.id}/permissoes`, novaPermissao);
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowPermissoes(false);
      setNovaPermissao({
        usuario_id: '',
        pode_editar: false
      });
    } catch (err) {
      console.error('Erro ao adicionar permissão:', err);
      setError('Não foi possível adicionar a permissão.');
    }
  };

  // Remover permissão
  const handleRemoverPermissao = async (usuarioId) => {
    try {
      await api.delete(`/gerenciamento/${gerenciamentoAtual.id}/permissoes/${usuarioId}`);
      await carregarGerenciamento(gerenciamentoAtual.id);
    } catch (err) {
      console.error('Erro ao remover permissão:', err);
      setError('Não foi possível remover a permissão.');
    }
  };

  // Atualizar checklist (marcar/desmarcar)
  const handleToggleChecklist = async (checklistId, concluido) => {
    try {
      await api.put(`/gerenciamento/${gerenciamentoAtual.id}/checklists/${checklistId}`, {
        concluido: !concluido
      });
      await carregarGerenciamento(gerenciamentoAtual.id);
    } catch (err) {
      console.error('Erro ao atualizar checklist:', err);
      setError('Não foi possível atualizar o checklist.');
    }
  };

  // Ativar/desativar checklist
  const handleToggleAtivoChecklist = async () => {
    if (!checklistParaToggle) return;
    
    try {
      await api.put(`/gerenciamento/${gerenciamentoAtual.id}/checklists/${checklistParaToggle.id}`, {
        ativo: !checklistParaToggle.ativo
      });
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowToggleChecklist(false);
      setChecklistParaToggle(null);
    } catch (err) {
      console.error('Erro ao atualizar status do checklist:', err);
      setError('Não foi possível atualizar o status do checklist.');
    }
  };

  // Excluir item
  const handleExcluirItem = async () => {
    try {
      await api.delete(`/gerenciamento/${gerenciamentoAtual.id}/itens/${itemParaExcluir}`);
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowConfirmDelete(false);
      setItemParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir item:', err);
      setError('Não foi possível excluir o item.');
    }
  };

  // Excluir ação
  const handleExcluirAcao = async () => {
    try {
      await api.delete(`/gerenciamento/${gerenciamentoAtual.id}/acoes/${acaoParaExcluir}`);
      await carregarGerenciamento(gerenciamentoAtual.id);
      setShowConfirmDelete(false);
      setAcaoParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir ação:', err);
      setError('Não foi possível excluir a ação.');
    }
  };

  // Verificar se o usuário tem permissão para editar
  const temPermissaoEditar = () => {
    if (!gerenciamentoAtual || !user) return false;
    
    // Administradores sempre podem editar
    if (user.is_admin) return true;
    
    // Criador pode editar
    if (gerenciamentoAtual.criado_por === user.id) return true;
    
    // Verificar permissões específicas
    const permissao = gerenciamentoAtual.permissoes?.find(p => p.usuario_id === user.id);
    return permissao?.pode_editar === true;
  };

  // Formatar data para exibição
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    try {
      return format(new Date(dataString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dataString;
    }
  };

  // Renderizar lista de gerenciamentos
  const renderGerenciamentos = () => {
    if (loading && !gerenciamentos.length) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando gerenciamentos...</p>
        </div>
      );
    }

    if (error && !gerenciamentos.length) {
      return (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      );
    }

    if (!gerenciamentos.length) {
      return (
        <Alert variant="info" className="my-3">
          Nenhum gerenciamento encontrado. Crie um novo gerenciamento para começar.
        </Alert>
      );
    }

    return (
      <Row className="mt-4">
        {gerenciamentos.map(gerenciamento => (
          <Col md={4} key={gerenciamento.id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{gerenciamento.titulo}</Card.Title>
                <Card.Text className="text-muted small">
                  {gerenciamento.descricao || 'Sem descrição'}
                </Card.Text>
                <ProgressBar 
                  now={gerenciamento.status * 100} 
                  label={`${Math.round(gerenciamento.status * 100)}%`} 
                  variant={gerenciamento.status === 1 ? 'success' : 'primary'}
                  className="mb-3"
                />
                <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
                  <div>
                    <FaCalendarAlt className="me-1" /> Início: {formatarData(gerenciamento.data_inicio)}
                  </div>
                  <div>
                    <FaCalendarAlt className="me-1" /> Conclusão: {formatarData(gerenciamento.data_conclusao)}
                  </div>
                </div>
                {gerenciamento.responsavel && (
                  <div className="small text-muted mb-2">
                    <strong>Responsável:</strong> {gerenciamento.responsavel}
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="bg-white">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-100"
                  onClick={() => carregarGerenciamento(gerenciamento.id)}
                >
                  <FaListAlt className="me-1" /> Ver Detalhes
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Renderizar detalhes do gerenciamento atual
  const renderGerenciamentoDetalhes = () => {
    if (!gerenciamentoAtual) return null;

    const podeEditar = temPermissaoEditar();

    return (
      <div className="mt-4">
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 className="mb-0">{gerenciamentoAtual.titulo}</h5>
            <div>
              <Button 
                variant="light" 
                size="sm" 
                className="me-2"
                onClick={() => setGerenciamentoAtual(null)}
              >
                Voltar
              </Button>
              {podeEditar && (
                <Button 
                  variant="light" 
                  size="sm"
                  onClick={() => setShowPermissoes(true)}
                >
                  <FaUserPlus className="me-1" /> Gerenciar Permissões
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col md={8}>
                <p className="text-muted">{gerenciamentoAtual.descricao || 'Sem descrição'}</p>
                
                {/* Campos adicionais de gestão de projetos */}
                <div className="mt-3">
                  <div className="mb-2">
                    <strong>Responsável:</strong> {gerenciamentoAtual.responsavel || 'Não definido'}
                  </div>
                  {gerenciamentoAtual.colaboradores && (
                    <div className="mb-2">
                      <strong>Colaboradores:</strong> {gerenciamentoAtual.colaboradores}
                    </div>
                  )}
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      <strong>Data de Início:</strong> {formatarData(gerenciamentoAtual.data_inicio)}
                    </div>
                    <div>
                      <strong>Data de Conclusão:</strong> {formatarData(gerenciamentoAtual.data_conclusao)}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <h2 className="display-4 mb-0">{Math.round(gerenciamentoAtual.status * 100)}%</h2>
                  <p className="text-muted">Concluído</p>
                  <ProgressBar 
                    now={gerenciamentoAtual.status * 100} 
                    variant={gerenciamentoAtual.status === 1 ? 'success' : 'primary'}
                    className="mt-2"
                  />
                </div>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12} className="d-flex justify-content-between">
                {podeEditar && (
                  <>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowNovoItem(true)}
                    >
                      <FaPlus className="me-1" /> Adicionar Item
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowNovaAcao(true)}
                    >
                      <FaPlus className="me-1" /> Adicionar Ação
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setShowToggleChecklist(true)}
                    >
                      <FaToggleOn className="me-1" /> Incluir/Excluir Checklist
                    </Button>
                  </>
                )}
              </Col>
            </Row>

            <div className="table-responsive mt-4">
              <Table bordered hover className="checklist-table">
                <thead className="table-light">
                  <tr>
                    {/* Célula dividida diagonalmente para Item/Ação */}
                    <th className="diagonal-cell text-center position-relative">
                      <div className="diagonal-container">
                        <div className="diagonal-line"></div>
                        <div className="diagonal-top-left">Item</div>
                        <div className="diagonal-bottom-right">Ação</div>
                      </div>
                    </th>
                    {gerenciamentoAtual.acoes.map(acao => (
                      <th key={acao.id} className="text-center position-relative vertical-header">
                        <div className="vertical-text">{acao.nome}</div>
                        {podeEditar && (
                          <Button
                            variant="link"
                            size="sm"
                            className="position-absolute top-0 end-0 p-0 text-danger"
                            onClick={() => {
                              setAcaoParaExcluir(acao.id);
                              setShowConfirmDelete(true);
                            }}
                          >
                            <FaTrash size={12} />
                          </Button>
                        )}
                      </th>
                    ))}
                    <th className="text-center bg-light" style={{ width: '100px' }}>STATUS</th>
                    <th className="text-center bg-light">Data de Início</th>
                    <th className="text-center bg-light">Data de Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {gerenciamentoAtual.itens.map(item => {
                    // Calcular status do item
                    const checklistsAtivos = gerenciamentoAtual.acoes.map(acao => {
                      const checklist = gerenciamentoAtual.itens
                        .find(i => i.id === item.id)?.checklists
                        ?.find(c => c.acao_id === acao.id);
                      return checklist;
                    }).filter(c => c && c.ativo);
                    
                    const checklistsConcluidos = checklistsAtivos.filter(c => c.concluido);
                    const statusItem = checklistsAtivos.length > 0 
                      ? checklistsConcluidos.length / checklistsAtivos.length 
                      : 0;
                    
                    return (
                      <tr key={item.id}>
                        <td className="position-relative">
                          {item.nome}
                          {podeEditar && (
                            <Button
                              variant="link"
                              size="sm"
                              className="position-absolute top-0 end-0 p-0 text-danger"
                              onClick={() => {
                                setItemParaExcluir(item.id);
                                setShowConfirmDelete(true);
                              }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          )}
                        </td>
                        
                        {gerenciamentoAtual.acoes.map(acao => {
                          const checklist = item.checklists?.find(c => c.acao_id === acao.id);
                          
                          return (
                            <td key={`${item.id}-${acao.id}`} className="text-center">
                              {checklist ? (
                                checklist.ativo ? (
                                  <Button
                                    variant="link"
                                    className={`p-0 ${checklist.concluido ? 'text-success' : 'text-secondary'}`}
                                    onClick={() => podeEditar && handleToggleChecklist(checklist.id, checklist.concluido)}
                                    disabled={!podeEditar}
                                  >
                                    {checklist.concluido ? <FaCheck size={20} /> : <FaTimes size={20} />}
                                  </Button>
                                ) : (
                                  <div className="text-muted bg-light p-2 rounded">
                                    <small>Desativado</small>
                                  </div>
                                )
                              ) : (
                                <span>-</span>
                              )}
                              
                              {podeEditar && checklist && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 ms-2 text-primary"
                                  onClick={() => {
                                    setChecklistParaToggle(checklist);
                                    setShowToggleChecklist(true);
                                  }}
                                >
                                  {checklist.ativo ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                                </Button>
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <strong>{Math.round(statusItem * 100)}%</strong>
                            <ProgressBar 
                              now={statusItem * 100} 
                              variant={statusItem === 1 ? 'success' : 'primary'}
                              style={{ width: '100%', height: '10px' }}
                              className="mt-1"
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          {item.data_inicio ? formatarData(item.data_inicio) : '-'}
                        </td>
                        <td className="text-center">
                          {item.data_conclusao ? formatarData(item.data_conclusao) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Modal para criar novo gerenciamento
  const renderModalNovoGerenciamento = () => (
    <Modal show={showNovoGerenciamento} onHide={() => setShowNovoGerenciamento(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Novo Gerenciamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control 
              type="text" 
              value={novoGerenciamento.titulo}
              onChange={(e) => setNovoGerenciamento({...novoGerenciamento, titulo: e.target.value})}
              placeholder="Digite o título do gerenciamento"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={novoGerenciamento.descricao}
              onChange={(e) => setNovoGerenciamento({...novoGerenciamento, descricao: e.target.value})}
              placeholder="Digite uma descrição (opcional)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Responsável</Form.Label>
            <Form.Control 
              type="text" 
              value={novoGerenciamento.responsavel}
              onChange={(e) => setNovoGerenciamento({...novoGerenciamento, responsavel: e.target.value})}
              placeholder="Nome do responsável"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Colaboradores</Form.Label>
            <Form.Control 
              type="text" 
              value={novoGerenciamento.colaboradores}
              onChange={(e) => setNovoGerenciamento({...novoGerenciamento, colaboradores: e.target.value})}
              placeholder="Nomes dos colaboradores (separados por vírgula)"
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Início</Form.Label>
                <Form.Control 
                  type="date" 
                  value={novoGerenciamento.data_inicio}
                  onChange={(e) => setNovoGerenciamento({...novoGerenciamento, data_inicio: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Conclusão</Form.Label>
                <Form.Control 
                  type="date" 
                  value={novoGerenciamento.data_conclusao}
                  onChange={(e) => setNovoGerenciamento({...novoGerenciamento, data_conclusao: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowNovoGerenciamento(false)}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCriarGerenciamento}
          disabled={!novoGerenciamento.titulo}
        >
          Criar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para adicionar novo item
  const renderModalNovoItem = () => (
    <Modal show={showNovoItem} onHide={() => setShowNovoItem(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome do Item</Form.Label>
            <Form.Control 
              type="text" 
              value={novoItem.nome}
              onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
              placeholder="Digite o nome do item"
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Início</Form.Label>
                <Form.Control 
                  type="date" 
                  value={novoItem.data_inicio || ''}
                  onChange={(e) => setNovoItem({...novoItem, data_inicio: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Conclusão</Form.Label>
                <Form.Control 
                  type="date" 
                  value={novoItem.data_conclusao || ''}
                  onChange={(e) => setNovoItem({...novoItem, data_conclusao: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowNovoItem(false)}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAdicionarItem}
          disabled={!novoItem.nome}
        >
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para adicionar nova ação
  const renderModalNovaAcao = () => (
    <Modal show={showNovaAcao} onHide={() => setShowNovaAcao(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Ação</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome da Ação</Form.Label>
            <Form.Control 
              type="text" 
              value={novaAcao.nome}
              onChange={(e) => setNovaAcao({...novaAcao, nome: e.target.value})}
              placeholder="Digite o nome da ação"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowNovaAcao(false)}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAdicionarAcao}
          disabled={!novaAcao.nome}
        >
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para gerenciar permissões
  const renderModalPermissoes = () => (
    <Modal show={showPermissoes} onHide={() => setShowPermissoes(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Gerenciar Permissões</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Permissões Atuais</h6>
        <Table striped bordered hover size="sm" className="mt-2">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Permissão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {gerenciamentoAtual?.permissoes?.map(permissao => (
              <tr key={permissao.id}>
                <td>{usuarios.find(u => u.id === permissao.usuario_id)?.nome || permissao.usuario_id}</td>
                <td>{permissao.pode_editar ? 'Editor' : 'Visualizador'}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoverPermissao(permissao.usuario_id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
            {!gerenciamentoAtual?.permissoes?.length && (
              <tr>
                <td colSpan="3" className="text-center">Nenhuma permissão adicional</td>
              </tr>
            )}
          </tbody>
        </Table>

        <hr />

        <h6>Adicionar Nova Permissão</h6>
        <Form className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Usuário</Form.Label>
            <Form.Select
              value={novaPermissao.usuario_id}
              onChange={(e) => setNovaPermissao({...novaPermissao, usuario_id: e.target.value})}
            >
              <option value="">Selecione um usuário</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox"
              id="permissao-editar"
              label="Permitir edição"
              checked={novaPermissao.pode_editar}
              onChange={(e) => setNovaPermissao({...novaPermissao, pode_editar: e.target.checked})}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPermissoes(false)}>
          Fechar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAdicionarPermissao}
          disabled={!novaPermissao.usuario_id}
        >
          Adicionar Permissão
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modal para confirmar exclusão
  const renderModalConfirmDelete = () => (
    <Modal show={showConfirmDelete} onHide={() => {
      setShowConfirmDelete(false);
      setItemParaExcluir(null);
      setAcaoParaExcluir(null);
    }}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Exclusão</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {itemParaExcluir && (
          <p>Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</p>
        )}
        {acaoParaExcluir && (
          <p>Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita e afetará todos os itens relacionados.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          setShowConfirmDelete(false);
          setItemParaExcluir(null);
          setAcaoParaExcluir(null);
        }}>
          Cancelar
        </Button>
        {itemParaExcluir && (
          <Button variant="danger" onClick={handleExcluirItem}>
            Excluir Item
          </Button>
        )}
        {acaoParaExcluir && (
          <Button variant="danger" onClick={handleExcluirAcao}>
            Excluir Ação
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );

  // Modal para ativar/desativar checklist
  const renderModalToggleChecklist = () => (
    <Modal show={showToggleChecklist} onHide={() => {
      setShowToggleChecklist(false);
      setChecklistParaToggle(null);
    }}>
      <Modal.Header closeButton>
        <Modal.Title>
          {checklistParaToggle 
            ? (checklistParaToggle.ativo ? 'Desativar Checklist' : 'Ativar Checklist')
            : 'Incluir/Excluir Checklist'
          }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {checklistParaToggle ? (
          <p>
            {checklistParaToggle.ativo 
              ? 'Tem certeza que deseja desativar este checklist? O item não será mais contabilizado no status.'
              : 'Tem certeza que deseja ativar este checklist? O item será contabilizado no status.'
            }
          </p>
        ) : (
          <>
            <p>Selecione o item e a ação para incluir ou excluir o checklist:</p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Item</Form.Label>
                <Form.Select
                  value={checklistParaToggle?.item_id || ''}
                  onChange={(e) => {
                    const itemId = e.target.value;
                    const item = gerenciamentoAtual.itens.find(i => i.id === parseInt(itemId));
                    if (item) {
                      setChecklistParaToggle({
                        ...checklistParaToggle,
                        item_id: parseInt(itemId)
                      });
                    }
                  }}
                >
                  <option value="">Selecione um item</option>
                  {gerenciamentoAtual?.itens.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ação</Form.Label>
                <Form.Select
                  value={checklistParaToggle?.acao_id || ''}
                  onChange={(e) => {
                    const acaoId = e.target.value;
                    setChecklistParaToggle({
                      ...checklistParaToggle,
                      acao_id: parseInt(acaoId)
                    });
                  }}
                  disabled={!checklistParaToggle?.item_id}
                >
                  <option value="">Selecione uma ação</option>
                  {gerenciamentoAtual?.acoes.map(acao => (
                    <option key={acao.id} value={acao.id}>
                      {acao.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {
          setShowToggleChecklist(false);
          setChecklistParaToggle(null);
        }}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleToggleAtivoChecklist}
          disabled={!checklistParaToggle}
        >
          {checklistParaToggle?.ativo === false ? 'Ativar' : 'Desativar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Container fluid className="py-4">
      {!gerenciamentoAtual ? (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Gerenciamento de Tarefas</h2>
            <Button 
              variant="primary"
              onClick={() => setShowNovoGerenciamento(true)}
            >
              <FaPlus className="me-2" /> Novo Gerenciamento
            </Button>
          </div>
          {renderGerenciamentos()}
        </>
      ) : (
        renderGerenciamentoDetalhes()
      )}

      {/* Modais */}
      {renderModalNovoGerenciamento()}
      {renderModalNovoItem()}
      {renderModalNovaAcao()}
      {renderModalPermissoes()}
      {renderModalConfirmDelete()}
      {renderModalToggleChecklist()}
    </Container>
  );
};

export default Gerenciamento;
