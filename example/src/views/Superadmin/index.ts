import {LeftBar} from "../../components";
import Main from "./component.main";
import TopBar from "./component.topbar";
import store, { StoreType } from "./script.store";

import { View } from "../../../../src";
import { User } from "../../models/User.model";
import { RepositoriesType } from "../../models";

const Superadmin: View<User, StoreType, RepositoriesType> =  { LeftBar, Main, store, TopBar }

export default Superadmin;