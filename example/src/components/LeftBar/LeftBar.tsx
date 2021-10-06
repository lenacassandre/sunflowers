import React from "react";
import { ViewComponent } from "../../../../src";

import {User} from '../../models/User.model';
import { NavigationMenu } from '../../components'

import "./LeftBar.scss";

export const LeftBar: ViewComponent<User, any, any> = (view): JSX.Element => {
	return (
		<>
			<p>User: {view.session.user?.userName}</p>
			<p>Roles: {view.session.user?.roles.reduce((string, role, i, a) => `${string}${role}${i < a.length - 1 ? "," : ""}`, "")}</p>
			<NavigationMenu user={view.session.user} currentPath={view.router.path} />
		</>
	);
};
