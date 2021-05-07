import {LeftBar} from "../../components";
import Main from "./component.main";
import store, { StoreType } from "./script.store";

import { View } from "../../../../src";
import { User } from "../../models/User.model";
import { RepositoriesType } from "../../models";

//@ts-ignore don't know what's happening here
const Users: View<User, StoreType, RepositoriesType> =  { LeftBar, Main, store }

export default Users;