import { faTintSlash } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider } from 'styled-components';
import {User as UserBaseModel, Factory} from '../../../src'

const factoryName = "user"


export class User extends UserBaseModel {
    firstName: string;
    lastName: string;
    roles: number[]; // 1 = superadmin. 2 = admin. 3 = responsable pédagogique. 4 = gestionnaire de salle. 5 = formateru référent. Les droits peuvent être accumulés. C'est pourquoi il y a un tableau.

    constructor(user: Partial<User> & {userName: string}) {
        super(factoryName, user)
        this.firstName = user.firstName || "";
        this.lastName = user.lastName || "";
        this.roles = user.roles || [];
    }
}

export class Users extends Factory<Users, User> {
    constructor(docs?: User[]) {
        super(factoryName, Users, User, docs)
    }
}

export default new Users()