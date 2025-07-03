import { KeyPressListener } from './keyPressListener'
import { ServerAdapter } from './shinyServer';
import './style.css'
import Alpine from 'alpinejs'
import type { Cat, GameState, Move, Player } from './types';

Alpine.store('gameState', {
  cats: [],
  players: [],
  playerId: null,
  level: null,

  setLevel(level: number) {
    this.level = level
  },

  setPlayerId(id: string) {
    this.playerId = id
  },

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
    console.log(`Updated cat ${id}`, newData);
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

// Handle Input Events

function tryToMove(playerId: string, move: Move) {
  const player = gameState.getPlayer(playerId)
  if (!player) return(null)

  if (move == 1) player.facing = "right"
  if (move == 3) player.facing = "left"

  gameServer.publish('player-request-move', { id: playerId, move: move })
}

function setupKeyboardControls(playerId: string, up: string, right: string, down: string, left: string): void {
  new KeyPressListener(up,    () => tryToMove(playerId, 2))
  new KeyPressListener(right, () => tryToMove(playerId, 1))
  new KeyPressListener(down,  () => tryToMove(playerId, 0))
  new KeyPressListener(left,  () => tryToMove(playerId, 3))
}

function setupPlayer(playerId: string): void {
  // Player-ID received from server, set it in game state
  gameState.setPlayerId(playerId)

  // Setup keyboard controls for the player
  setupKeyboardControls(playerId, "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft")
}

Alpine.start()

const gameServer = new ServerAdapter();

gameServer.subscribe('new-level',     ({ level })       => gameState.setLevel(level as number))
gameServer.subscribe('set-player-id', (id)              => setupPlayer(id as string))
gameServer.subscribe('add-cat',       (cat)             => gameState.addCat(cat as Cat))
gameServer.subscribe('remove-cat',    (id)              => gameState.removeCat(id))
gameServer.subscribe('add-player',    (player)          => gameState.addPlayer(player as Player))
gameServer.subscribe('remove-player', (id)              => gameState.removePlayer(id))
gameServer.subscribe('update-cat',    ({ id, newData }) => gameState.updateCat(id, newData))
gameServer.subscribe('update-player', ({ id, newData }) => gameState.updatePlayer(id, newData))
