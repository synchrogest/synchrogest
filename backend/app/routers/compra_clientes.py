from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.models.compra_clientes import CompraCliente
from app.models.compra_itens import CompraItem
from app.models.produto import Produto
from app.models.movimentacao import Movimentacao
from app.schemas.compra_clientes import CompraClienteCreate, CompraClienteResponse
from app.services.auth_cliente import get_current_cliente

router = APIRouter(tags=["Compras"])

@router.post("/", response_model=CompraClienteResponse, status_code=status.HTTP_201_CREATED)
def finalizar_compra(
    compra: CompraClienteCreate,
    db: Session = Depends(get_db),
    cliente = Depends(get_current_cliente)
):
    """
    Finaliza uma compra de cliente, cria o registro e gera movimentações de saída no estoque.
    """

    # Verificar se há itens na compra
    if not compra.itens or len(compra.itens) == 0:
        raise HTTPException(status_code=400, detail="A compra deve conter pelo menos um item.")

    # Criar o registro da compra
    nova_compra = CompraCliente(
        cliente_id=cliente.id,
        data_compra=datetime.utcnow(),
        valor_total=compra.total
    )
    db.add(nova_compra)
    db.flush()  # gera o ID da compra antes de adicionar itens

    # Para cada item comprado, criar o registro e gerar movimentação de saída
    for item in compra.itens:
        # Salvar item da compra
        novo_item = CompraItem(
            compra_id=nova_compra.id,
            produto_id=item.produto_id,
            nome=item.nome,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario
        )
        db.add(novo_item)

        # Atualizar estoque do produto
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto com ID {item.produto_id} não encontrado"
            )

        if produto.quantidade < item.quantidade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estoque insuficiente para o produto '{produto.nome}'. Disponível: {produto.quantidade}"
            )

        produto.quantidade -= item.quantidade

        # Criar movimentação de saída
        movimentacao = Movimentacao(
            produto_id=item.produto_id,
            usuario_id=None,  # compra feita por cliente (não usuário interno)
            tipo="saida",
            quantidade=item.quantidade,
            data=datetime.utcnow(),
            observacoes=f"Venda automática gerada pela compra #{nova_compra.id}"
        )
        db.add(movimentacao)

    db.commit()
    db.refresh(nova_compra)

    return nova_compra


@router.get("/", response_model=list[CompraClienteResponse])
def listar_compras(db: Session = Depends(get_db)):
    """
    Lista todas as compras registradas.
    """
    compras = db.query(CompraCliente).all()
    return compras


@router.get("/{compra_id}", response_model=CompraClienteResponse)
def obter_compra(compra_id: int, db: Session = Depends(get_db)):
    """
    Obtém os detalhes de uma compra específica.
    """
    compra = db.query(CompraCliente).filter(CompraCliente.id == compra_id).first()
    if not compra:
        raise HTTPException(status_code=404, detail="Compra não encontrada")
    return compra


@router.delete("/{compra_id}")
def deletar_compra(compra_id: int, db: Session = Depends(get_db)):
    """
    Remove uma compra e (opcionalmente) pode reverter as movimentações associadas.
    """
    compra = db.query(CompraCliente).filter(CompraCliente.id == compra_id).first()
    if not compra:
        raise HTTPException(status_code=404, detail="Compra não encontrada")

    db.delete(compra)
    db.commit()
    return {"message": "Compra removida com sucesso"}
