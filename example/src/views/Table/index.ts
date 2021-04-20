import LeftBar from "./component.leftbar";
import Main from "./component.main";
import store, { StoreType } from "./script.store";

import { View } from "../../../../src";
import { User } from "../../models/User.model";

const Table: View<User, StoreType> =  { LeftBar, Main, store }

export default Table;