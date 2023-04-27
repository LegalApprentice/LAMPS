import { Tools } from '@app/shared';
import { LaAtom } from '../shared/la-atom';

export interface ILaCommand {
  name: string;
  [key: string]: any;
}

export class LaCommand extends LaAtom implements ILaCommand {
  name: string = '';
  label: string = '';
  style: string = '';
  isDivider: boolean = false;
  routerLink: string = '';
  action:() => void;

  private _toolTipRule: () => string;
  private _existWhen: () => boolean;
  private _visibleWhen: () => boolean;

  constructor(properties?: ILaCommand) {
    super(properties);
    this.override(properties);

    if (Tools.isEmpty(this.routerLink)) {
      this.routerLink = `/${this.name}`
    }

    if (Tools.isEmpty(this.label)) {
      this.label = Tools.capitalize(this.name)
    }
  }

  get isVisible(): boolean {
    if (this._visibleWhen == undefined) return true;
    return this._visibleWhen && this._visibleWhen();
  }

  get canExist(): boolean {
    if (this._existWhen == undefined) return true;
    return this._existWhen && this._existWhen();
  }

  get toolTip(): string {
    if (this._toolTipRule == undefined) return this.label;
    return this._toolTipRule && this._toolTipRule();
  }

  toolDetails(rule: () => string): LaCommand {
    this._toolTipRule = rule;
    return this;
  }

  existIf(rule: () => boolean): LaCommand {
    this._existWhen = rule;
    return this;
  }

  divider(value: boolean): LaCommand {
    this.isDivider = value;
    return this;
  }

  visibleIf(rule: () => boolean): LaCommand {
    this._visibleWhen = rule;
    return this;
  }

}

export class LaCommandSet extends LaAtom {

  members: Array<LaCommand> = new Array<LaCommand>();

  constructor(properties?: any) {
    super(properties);
  }

  getCommands(): Array<LaCommand> {
    return this.members;
  }

  clear() {
    this.members = new Array<LaCommand>();
    return this.members;
  }

  addCommand(props: ILaCommand): LaCommand {
    const cmd = new LaCommand(props);
    this.members.push(cmd);
    return cmd;
  }

  static quickMenu(list: any[]){
    const menu = new LaCommandSet();
    list.forEach( item => {
      menu.addCommand(item);
    })

    return menu.getCommands();
  }
}

export let MainMenu: LaCommandSet = new LaCommandSet();

