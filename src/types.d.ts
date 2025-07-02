export type Move = 0 | 1 | 2 | 3

export type Position = { x: number, y: number }

interface ICharacter {
  id: string,
  x: number,
  y: number,
  facing: 'top' | 'right' | 'bottom' | 'left',
  model: string
}

export type Cat = ICharacter & {
  model: 'orange' | 'gray' | 'black' | 'red',
  lastMove: Move | null,
  fuss: number,
  trapped: boolean
}

export type Player = ICharacter & {
  name: string,
  model: 'red' | 'orange' | 'yellow' | 'green' | 'purple'
}

export type GameState = {
  players: Player[],
  cats: Cat[],
  playerId: string | null,
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, newData: Partial<Player>) => void;
  getPlayer: (id: string) => Player | undefined;
  addCat: (cat: Cat) => void;
  updateCat: (id: string, newData: Partial<Cat>) => void;
  removeCat: (id: string) => void;
}
