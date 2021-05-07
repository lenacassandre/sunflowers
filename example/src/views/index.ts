import Plants from "./Plants";
import Users from "./Users";
import Superadmin from "./Superadmin";
import Connexion from "./Connexion";
import Inscription from "./Inscription";
import { ViewDeclaration, ViewsTree } from "../../../src";
import {User} from '../models/User.model'

const views: (
	ViewDeclaration<User, any, any> & {
		menu?: boolean
	}
)[] = [
	{
		path: ["connexion"],
		view: Connexion,
		title: "Connexion",
		className: "Connexion",
		default: true,
	},
	{
		path: ["inscription"],
		view: Inscription,
		title: "Inscription",
		className: "Inscription",
	},
	{
		path: ["", "/", "plants"],
		view: Plants,
		title: "plantttssss",
		auth: true,
		className: "Plants",
		menu: true
	},
	{
		path: "users",
		view: Users,
		title: "Utilisateurs",
		className: "Users",
		menu: true
	},
	{
		path: "superadmin",
		view: Superadmin,
		title: "Superadmin",
		auth: true,
		className: "Superadmin",
		roles: [1],
		menu: true
	},
]

//////////////////////////////////////////////////////////////////////////////////////////////////////

export default views;
