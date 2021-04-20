import Table from "./Table";
import { ViewDeclaration, ViewsTree } from "../../../src";
import {User} from '../models/User.model'
import { IconDefinition, faHome, faCalendarAlt, faFileContract, faGraduationCap, faChalkboardTeacher, faSchool, faEuroSign, faUsers, } from "@fortawesome/free-solid-svg-icons";

const views: (
	ViewDeclaration<User, any, any>
)[] = [
	{
		path: ["", "/", "Example"],
		view: Table,
		title: "Example",
		auth: true,
		className: "Example",
		default: true
	},
]

//////////////////////////////////////////////////////////////////////////////////////////////////////

export default views;
