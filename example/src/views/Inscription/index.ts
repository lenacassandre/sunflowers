import Main from "./component.main";
import store, { StoreType } from "./script.store";

import { View } from "../../../../src";
import { User } from "../../models/User.model";

const Inscription: View<User, StoreType> =  { Main, store }

export default Inscription;