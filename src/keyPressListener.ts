export class KeyPressListener {
  keyupFunction;
  keydownFunction;

  constructor(keyCode: string, callback: () => void) {
    let keySafe = true;
    this.keydownFunction = function(event: KeyboardEvent) {
      if (event.code === keyCode) {
         if (keySafe) {
            keySafe = false;
            callback();
         }  
      }
   };
   this.keyupFunction = function(event: KeyboardEvent) {
      if (event.code === keyCode) {
         keySafe = true;
      }         
   };
   document.addEventListener("keydown", this.keydownFunction);
   document.addEventListener("keyup", this.keyupFunction);
  }

  unbind() { 
    document.removeEventListener("keydown", this.keydownFunction);
    document.removeEventListener("keyup", this.keyupFunction);
  }
}