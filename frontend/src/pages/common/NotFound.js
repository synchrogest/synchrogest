import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center mt-5">
      <Alert variant="danger">
        <Alert.Heading>Erro 404 - Página Não Encontrada</Alert.Heading>
        <p>
A página que você está procurando não existe ou foi movida.
        </p>
        <hr />
        <p className="mb-0">
          Voltar para o <Link to="/dashboard">Dashboard</Link>.
        </p>
      </Alert>
    </Container>
  );
};

export default NotFound;
