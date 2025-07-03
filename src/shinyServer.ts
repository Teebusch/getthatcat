declare global {
  var Shiny: any;  // TODO: import Shiny Type Definitions
}

type ServerMessage = {
  topic: 'set-player-id' | 'update-player' | 'add-player' | 'remove-player' | 'player-request-move' | 'add-cat' | 'update-cat' | 'remove-cat';
  data: {};
}


const mockShinyObject = {
  handlers: [] as { name: string, handler: (message: any) => void}[],

  setInputValue: function(name: string, value: any, options: {}) {
    console.log(`Mock Shiny: setInputValue called with name=${name}, value=${value}, options=${JSON.stringify(options)}`);
  },

  addCustomMessageHandler: function(name: string, handler: (message: any) => void) {
    this.handlers.push({ name: name, handler: handler });
    console.log(`Mock Shiny: CustomMessageHandler added for Event '${name}'`);
  },

  notify: function(name: string, message: any) {
    console.log(`Mock Shiny: Mocking Event '${name}'`, message);
    this.handlers.forEach(h => {
        if (h.name == name) {
            h.handler(message)
        }
    })
  }
}


export class ServerAdapter {
  #Shiny;

  constructor(mockShiny = true) {
    this.#Shiny = window.Shiny;
    
    if (!this.#Shiny) {
      if (mockShiny) {
        console.warn("Shiny JavaScript library is not available. Using mock Shiny object.");
        this.#Shiny = mockShinyObject;
        mockServerMessages(this.#Shiny)
      } else {
        throw new Error("Shiny JavaScript library is not available.");
      }
    }
  }

  publish(topic: string, data: any) {
    this.#Shiny.setInputValue(topic, data, {priority: "event"});
  }

  subscribe(topic: string, callback: (data: any) => void) {
    this.#Shiny.addCustomMessageHandler(topic, (evt: any) => {
      // console.log(`Received message for topic '${topic}'`, evt);
      callback(evt);
    });
  }
}


function mockServerMessages(shiny: typeof mockShinyObject) {
    setTimeout(
        () => {
            shiny.notify('set-player-id', '1')
            shiny.notify('add-player', { id: '1', name: 'Hubert', model: 'green', facing: 'right', x: 9, y: 5 })
            shiny.notify('add-player', { id: 'local2', name: 'Sallly', model: 'purple', facing: 'left', x: 2, y: 9 })
            shiny.notify('add-player', { id: 'local3', name: 'Bob', model: 'red', facing: 'left', x: 4, y: 6 })
            shiny.notify('add-cat', { id: '1', x: 8, y: 5, facing: 'left', lastMove: null, model: 'orange', fuss: 5, trapped: false })
            shiny.notify('add-cat', { id: '2', x: 3, y: 5, facing: 'left', lastMove: null, model: 'gray', fuss: 5, trapped: false })
            shiny.notify('add-cat', { id: '3', x: 3, y: 5, facing: 'left', lastMove: null, model: 'black', fuss: 5, trapped: false })
            shiny.notify('add-cat', { id: '4', x: 3, y: 5, facing: 'left', lastMove: null, model: 'red', fuss: 5, trapped: false })
        },
        1000
    )

}