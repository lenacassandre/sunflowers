import { faTintSlash } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider } from 'styled-components';
import {User as UserBaseModel, Repository} from '../../../src'

const repositoryName = "user"


export class User extends UserBaseModel {
    firstName: string;
    lastName: string;
    constructor(user: Partial<User> & {userName: string}) {
        super(repositoryName, user)
        this.firstName = user.firstName || "";
        this.lastName = user.lastName || "";
    }
}

// @ts-ignore
export class Users extends Repository<Users, User> {
    constructor(docs?: User[]) {
        super(repositoryName, Users, User, docs)
    }
}

export default new Users()