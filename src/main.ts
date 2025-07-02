import { KeyPressListener } from './keyPressListener'
import { ServerAdapter } from './shinyServer';
import './style.css'
import Alpine from 'alpinejs'
import type { Cat, GameState, Move, Player, Position } from './types';

const gameServer = new ServerAdapter();

Alpine.store('gameState', {
  cats: [],
  players: [],
  playerId: null,

  addPlayer(player: Player) {
    this.players.push(player)
  },

  updatePlayer(id, newData) {
    let idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.players[idx] = { ...this.players[idx], ...newData}
    }
  },

  removePlayer(id) {
    let idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.players.splice(idx, 1);
    }
  },

  getPlayer(id) {
    let player = this.players.find(p => p.id === id);
    return(player)
  },

  addCat(cat: Cat) {
    this.cats.push(cat)
  },

  updateCat(id, newData) {
    let idx = this.cats.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.cats[idx] = { ...this.cats[idx], ...newData}
    }
  },

  removeCat(id) {
    let idx = this.cats.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.cats.splice(idx, 1);
    }
  }
} as GameState)


// Setup Game
const gameState = (Alpine.store('gameState') as GameState)



// Server Logic --> Move

function getNextMove(currentX: number, currentY: number, lastMove: Move | null): { 
  move: Move, 
  positionAfterMove: Position 
} | null {
  if (!lastMove) {
    lastMove = Math.floor(Math.random() * 4) as Move
  }  
  const randomlyChangeDirection = Math.random() > 0.7;
  const start = (lastMove + (randomlyChangeDirection ? 1 : 0)) % 4
  const turnLeft = Math.random() < 0.5

  let tryMove = start;
  for (let i = 0; i <= 3; i++) {
    if (tryMove < 0) tryMove = 3
    if (tryMove > 3) tryMove = 0
    
    let newPosition = getPositionAfterMove(currentX, currentY, tryMove as Move)
    
    if (isFreeTile(newPosition.x, newPosition.y)) {
      return({
        move: tryMove as Move,
        positionAfterMove: newPosition
      })
    }

    turnLeft ? tryMove-- : tryMove++
  }

  return(null)
}


function getPositionAfterMove(currentX: number, currentY: number, move: Move) {
    let newX = currentX
    let newY = currentY

    switch (move) {
      case 0:
        newY += 1
        break;
      case 1:
        newX += 1
        break;
      case 2:
        newY -= 1
        break;
      case 3:
        newX -= 1
        break;
    }

    return({ x: newX, y: newY })
}


const mapData = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: new Map([
    ["7x4", true],
    ["1x11", true],
    ["12x10", true],
    ["4x7", true],
    ["5x7", true],
    ["6x7", true],
    ["8x6", true],
    ["9x6", true],
    ["10x6", true],
    ["7x9", true],
    ["8x9", true],
    ["9x9", true],
  ])
}


function getKeyString(x: number, y: number): string {
  return `${x}x${y}`;
}


function isFreeTile(x: number, y: number) {
  let isOnMap = 
    x >= mapData.minX && 
    x < mapData.maxX &&
    y >= mapData.minY && 
    y < mapData.maxY
    
  const positionToCheck = getKeyString(x, y)
  const isBlocked = mapData.blockedSpaces.has(positionToCheck)
  const players = gameState.players
  const cats = gameState.cats
  const isOccupied = players.findIndex(p => p.x == x && p.y == y) != -1 || cats.findIndex(p => p.x == x && p.y == y) != -1

  return(isOnMap && !isBlocked && !isOccupied)
}


// move cats around randomly

setInterval(() => {
  const cats = (Alpine.store('gameState') as GameState).cats

  cats.forEach(cat => {
    let nextMove = getNextMove(cat.x, cat.y, cat.lastMove)

    if (nextMove) {
      cat.x = nextMove.positionAfterMove.x
      cat.y = nextMove.positionAfterMove.y
      if (nextMove.move == 1) cat.facing = "right"
      if (nextMove.move == 3) cat.facing = "left"
      cat.lastMove = nextMove.move;
      cat.trapped = false
      cat.fuss = 5
    } else {
      // cat trapped -- becomes less fuzzy until 0, then remove cat
      cat.trapped = true
      cat.lastMove = null
      cat.fuss -= 1
      if (cat.fuss == 0) {
        gameState.removeCat(cat.id)
      }
    }
  });
}, 500);


// Handle Input Events

function tryToMove(playerId: string, move: Move) {
  const player = gameState.getPlayer(playerId)
  if (!player) return(null)

  if (move == 1) player.facing = "right"
  if (move == 3) player.facing = "left"

  const positionAfterMove = getPositionAfterMove(player.x, player.y, move)
  const isFree = isFreeTile(positionAfterMove.x, positionAfterMove.y)
  if (isFree) gameState.updatePlayer(playerId, { ...positionAfterMove })

  gameServer.publish('player-request-move', { id: playerId, move: move })
}

function setupKeyboardControls(playerId: string, up: string, right: string, down: string, left: string): void {
  new KeyPressListener(up,    () => tryToMove(playerId, 2))
  new KeyPressListener(right, () => tryToMove(playerId, 1))
  new KeyPressListener(down,  () => tryToMove(playerId, 0))
  new KeyPressListener(left,  () => tryToMove(playerId, 3))
}

setupKeyboardControls('1', "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft")
setupKeyboardControls('2', "KeyW", "KeyD", "KeyS", "KeyA")
setupKeyboardControls('3', "KeyI", "KeyL", "KeyK", "KeyJ")

gameServer.subscribe('set-player-id', (id)              => gameState.playerId = id as string)
gameServer.subscribe('add-cat',       (cat)             => gameState.addCat(cat as Cat))
gameServer.subscribe('update-cat',    ({ id, newData }) => gameState.updateCat(id, newData))
gameServer.subscribe('remove-cat',    (id)              => gameState.removeCat(id))
gameServer.subscribe('add-player',    (player)          => gameState.addPlayer(player as Player))
gameServer.subscribe('update-player', ({ id, newData }) => gameState.updatePlayer(id, newData))
gameServer.subscribe('remove-player', (id)              => gameState.removePlayer(id))

Alpine.start()