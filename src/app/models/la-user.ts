import { LaAtom } from '../shared/la-atom';

export class Login extends LaAtom {
  username: string;
  password: string;

  constructor(properties?: any) {
    super(properties);
  }
}

export class LaUser extends LaAtom {
  constructor(properties?: any) {
    super(properties);
  }
  
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;

  private _admin = false;

  asJson() {
    const result = {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email
    };
    return result;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  displayName() {
    const extra = this._admin ? '*' : '';
    return this.username ? `${extra}${this.username}` : '';
  }

  markAsAdmin() {
    this._admin = true;
  }

  isAdmin() {
    return this._admin;
  }
}

