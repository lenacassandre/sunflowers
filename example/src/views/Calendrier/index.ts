import {LeftBar} from "../../components";
import Main from "./component.main";
import TopBar from "./component.topbar";
import store, { StoreType } from "./script.store";

import { View } from "../../../../src";
import { User } from "../../models/User.model";

const Calendrier: View<User, StoreType> =  { LeftBar, Main, TopBar, store }

export default Calendrier;