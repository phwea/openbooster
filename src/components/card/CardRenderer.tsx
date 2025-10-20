import React from 'react'
import { ProgrammaticCard } from './ProgrammaticCard'

export function CardRenderer({ card, fxOn, topActive, onClick }: { card: any; fxOn: boolean; topActive: boolean; onClick: ()=>void; suspense?: boolean }){
  return (
    <ProgrammaticCard
      card={card}
      onClick={onClick}
      topActive={topActive}
      fxOn={fxOn}
    />
  )
}
