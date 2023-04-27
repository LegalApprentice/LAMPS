// Credit to https://gist.github.com/sasxa
// Imports
import { Injectable, EventEmitter } from '@angular/core';

// https://scotch.io/tutorials/angular-2-http-requests-with-observables

@Injectable()
export class EmitterService {
  // Event store
  private static _emitters: { [ID: string]: EventEmitter<any> } = {};
  // Set a new event in the store with a given ID  as key
  static get(ID: string): EventEmitter<any> {
    if (!this._emitters[ID]) {
      const source = new EventEmitter();
      this._emitters[ID] = source;
    }
    return this._emitters[ID];
  }

  static has(ID: string): boolean {
    return this._emitters[ID] ? true : false;
  }

  static processCommands(target) {
    const cmd = EmitterService.get('COMMAND');

    cmd.subscribe(cmd => {
      const { command, args, source } = cmd;
      const name = `cmd${command}`;

      const funct = target[name];
      if (funct) {
        funct.call(target, args, source);
        // Toast.success(name);
      } else {
        // Toast.error(name, 'command not found');
      }
    });
    return cmd;
  }

  static broadcastCommand(source, topic: string, args: any= null, callback: any= null) {

    const list = topic.split(';')
    for(var i=0; i<list.length; i++){
      let t = 10 * (i+1)
      let command = list[i]
      setTimeout(function() {
        const cmd = {
          command,
          args,
          source
        };
        EmitterService.get('COMMAND').emit(cmd);
        callback && callback();
      }, t);
    }

  }



  static registerCommand(source, command: string, func) {
    const name = `cmd${command}`;
    source[name] = func;
  }

  static unregisterCommand(source, command: string) {
    const name = `cmd${command}`;
    delete source[name];
  }

  static displayToast(source, funct) {
    !EmitterService.has('SHOWERROR') && EmitterService.get('SHOWERROR').subscribe(item => {
      funct.call(source, 'error', item.title, item.message);
    });

    !EmitterService.has('SHOWWARNING') && EmitterService.get('SHOWWARNING').subscribe(item => {
      funct.call(source, 'warning', item.title, item.message);
    });

    !EmitterService.has('SHOWINFO') && EmitterService.get('SHOWINFO').subscribe(item => {
      funct.call(source, 'info', item.title, item.message);
    });

    !EmitterService.has('SHOWSUCCESS') && EmitterService.get('SHOWSUCCESS').subscribe(item => {
      funct.call(source, 'success', item.title, item.message);
    });
  }

}

class PopupToast {
  error(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWERROR').emit(toast);
    console.error('SHOWERROR', message)
  }
  warning(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWWARNING').emit(toast);
    console.warn('SHOWWARNING', message)
  }
  success(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWSUCCESS').emit(toast);
    console.info('SHOWSUCCESS', message)
  }
  info(message: string, title?: string) {
    const toast = {
      title: title || '',
      message
    };
    EmitterService.get('SHOWINFO').emit(toast);
    console.log('SHOWINFO', message)
  }
}

export const Toast: PopupToast = new PopupToast();
