
import React from "react";
import { TabsButtons, ViewComponent } from "../../../../src";
import { RepositoriesType } from "../../models";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";


////////////////////////////////////////////////////////////////////////////////////////////////////////:
const TopBar: ViewComponent<User, StoreType, RepositoriesType> = (view): JSX.Element => {
	return (
        <TabsButtons
            active={view.store.page}
            pages={["Organisations", "Utilisateurs"]}
            onClick={(page) => view.update({page})}
        />
	);
};

export default TopBar