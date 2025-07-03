import type { Cat, GameState, Move, Player, Position } from './types';


export class ServerAdapter {
    #subscribers = [] as { topic: string, callback: (message: any) => void }[]

    publish(topic: string, data: any) {
        this.#subscribers.forEach(s => {
            if (s.topic == topic) {
                s.callback(data)
            }
        })
    }

    subscribe(topic: string, callback: (data: any) => void) {
        this.#subscribers.push({ topic: topic, callback: callback });
    }
}


const gameState: GameState = {
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
}


function getNextMove(currentX: number, currentY: number, lastMove: Move | null): {
    move: Move,
    positionAfterMove: Position
} | null {
    if (!lastMove) {
        lastMove = Math.floor(Math.random() * 4) as Move
    }
    const randomlyChangeDirection = Math.random() > 0.9;
    const start = lastMove + (randomlyChangeDirection ? 1 : 0) % 4
    const turnLeft = Math.random() < 0.5

    let tryMove = start;
    for (let i = 0; i <= 3; i++) {
        turnLeft ? tryMove-- : tryMove++
        if (tryMove < 0) tryMove = 3
        if (tryMove > 3) tryMove = 0

        let newPosition = getPositionAfterMove(currentX, currentY, tryMove as Move)

        if (isFreeTile(newPosition.x, newPosition.y)) {
            return ({
                move: tryMove as Move,
                positionAfterMove: newPosition
            })
        }
    }

    return (null)
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

    return ({ x: newX, y: newY })
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

    return (isOnMap && !isBlocked && !isOccupied)
}


// function startGame() {
//     let cats: Cat[] = []

//     // add some cats
//     cats.push({ id: '1', x: 8, y: 5, facing: 'left', lastMove: null, model: 'orange', fuss: 5, trapped: false })
//     cats.push({ id: '2', x: 3, y: 5, facing: 'left', lastMove: null, model: 'gray', fuss: 5, trapped: true })
//     cats.push({ id: '3', x: 3, y: 5, facing: 'left', lastMove: null, model: 'black', fuss: 5, trapped: false })
//     cats.push({ id: '4', x: 3, y: 5, facing: 'left', lastMove: null, model: 'red', fuss: 5, trapped: false })

//     // move cats around randomly
//     setInterval(() => {
//         cats.forEach(cat => {
//             let nextMove = getNextMove(cat.x, cat.y, cat.lastMove)

//             if (nextMove) {
//                 cat.x = nextMove.positionAfterMove.x
//                 cat.y = nextMove.positionAfterMove.y
//                 if (nextMove.move == 1) cat.facing = "right"
//                 if (nextMove.move == 3) cat.facing = "left"
//                 cat.lastMove = nextMove.move;
//                 cat.trapped = false
//             } else {
//                 // cat trapped -- becomes less fuzzy until 0, then remove cat
//                 cat.trapped = true
//                 cat.lastMove = null
//                 cat.fuss -= 1
//                 if (cat.fuss == 0) {
//                     gameState.removeCat(cat.id)
//                 }
//             }
//         });
//     }, 500);
// }