import React, { useRef, useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import BoardContext from '../Board/context'

/**
 * UseDrop poderia ter sido colocado na lista mas seguindo exemplo
 * foi optado colocar no card para ter controle tanto card que esta sendo arrastado
 * quanto do card embaixo deste e assim dado o local onde o card que esta sendo arrastado
 * se encontra fica fácil colocado antes ou depois do que esta embaixo
 * Além disso, o ordenamento da lista fica mais complexo quando colocado na lista
 */

import { Container, Label } from './styles';

export default function Card({ data, index, listIndex }) {
  const ref = useRef();
  const { move } = useContext(BoardContext)

  const [{ isDragging }, dragRef] = useDrag({
    type: "CARD",
    item: { type: "CARD", index, listIndex },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    })
  })

  //index vem do map que foi usado na renderização de todos os cards no list

  const [, dropRef] = useDrop({
    accept: "CARD",
    hover(item, monitor) {
      const draggedListIndex = item.listIndex //qual lista o arrastado esta
      const targetListIndex = listIndex  //qual lista o alvo esta

      const draggedIndex = item.index;//posicao do item arraastado
      const targetIndex = index;//posicao do item atual que esta embaixo no hover

      if (draggedIndex === targetIndex && draggedListIndex === targetListIndex) return
      /*se o index do arrastado e do alvo(que esta no hover embaixo) não fazer nada
      *já que é o mesmo item
      */
      const targetSize = ref.current.getBoundingClientRect();//todas as informacoes do alvo hover
      const targetCenter = (targetSize.bottom - targetSize.top) / 2
      //pegando a distancia do fundo do elemento e do inicio do topo da pagina(eixo y) e subtraindo-as para obter a diferenca
      //essa diferenca e o tamanho do componente que vai ser divido por dois pra achar o centro

      const draggedOffSet = monitor.getClientOffset();//quanto foi arrastado do componente arrastado
      const draggedTop = draggedOffSet.y - targetSize.top;
      /** Distancia do elemento arrastado do topo da tela subtraida pela distancia do alvo hover do topo
       * o resultado é igual ao quanto que o arrastado entrou dentro do alvo hover
       */

      //  início dos teste pra ver se o card fica no começo duma lista ou no fim. Se ele esta entre dois cards ou nap
      //do contrário ele precisa mexer

      if (draggedIndex < targetIndex && draggedTop < targetCenter) return;
      /**se a posicao do arrastado for menor que a do alvo ele ta antes e o tanto que percorreu for menor que o centro
       * nao deve fazer nada pq o arrastado esta ocupando o espaco inicial dele
       * pq ta antes e ainda ta mt perto de onde tava
       */

      if (draggedIndex > targetIndex && draggedTop > targetCenter) return;
      /**se a posicao do arrastado for maior que a do alvo ele ta depois e se o tanto que ele percorrei for maior 
       * nesse caso significado que ele ta prox. da posicao inicial pq ele vem antes e so chegou perto de sai do lugar
       * inicial
      */

      //  Fim da verficiao se esta entre cards ou no começo/fim da lista

      move(draggedListIndex, targetListIndex, draggedIndex, targetIndex)
      item.index = targetIndex
      item.listIndex = targetListIndex
    }
  })

  dragRef(dropRef(ref));

  return (
    <Container ref={ref} isDragging={isDragging}>
      <header>
        {data.labels.map(label => <Label key={label} color={label} />)}
      </header>
      <p>{data.content}</p>
      {data.user && <img src={data.user} alt="" />}
    </Container>)
}