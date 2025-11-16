from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pagamentos import Pagamento
from app.schemas.pagamentos import PagamentoCreate, PagamentoResponse
from typing import List

router = APIRouter(
    prefix="/api/pagamentos",
    tags=["pagamentos"]
)

@router.post("/", response_model=PagamentoResponse)
def criar_pagamento(pagamento: PagamentoCreate, db: Session = Depends(get_db)):
    novo_pagamento = Pagamento(
        compra_id=pagamento.compra_id,
        cliente_id=pagamento.cliente_id,
        metodo=pagamento.metodo,
        valor=pagamento.valor,
        status="pendente"
    )
    db.add(novo_pagamento)
    db.commit()
    db.refresh(novo_pagamento)
    return novo_pagamento

@router.get("/", response_model=List[PagamentoResponse])
def listar_pagamentos(db: Session = Depends(get_db)):
    return db.query(Pagamento).all()

@router.get("/{pagamento_id}", response_model=PagamentoResponse)
def obter_pagamento(pagamento_id: int, db: Session = Depends(get_db)):
    pagamento = db.query(Pagamento).filter(Pagamento.id == pagamento_id).first()
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    return pagamento

@router.put("/{pagamento_id}", response_model=PagamentoResponse)
def atualizar_pagamento(pagamento_id: int, dados: PagamentoCreate, db: Session = Depends(get_db)):
    pagamento = db.query(Pagamento).filter(Pagamento.id == pagamento_id).first()
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    for key, value in dados.dict(exclude_unset=True).items():
        setattr(pagamento, key, value)
    db.commit()
    db.refresh(pagamento)
    return pagamento

@router.delete("/{pagamento_id}")
def deletar_pagamento(pagamento_id: int, db: Session = Depends(get_db)):
    pagamento = db.query(Pagamento).filter(Pagamento.id == pagamento_id).first()
    if not pagamento:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    db.delete(pagamento)
    db.commit()
    return {"detail": "Pagamento removido com sucesso"}
