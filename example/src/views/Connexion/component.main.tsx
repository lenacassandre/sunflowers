import React from "react";
import { Button, Input, Link, ViewComponent } from "../../../../src";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const Main: ViewComponent<User, StoreType> = (view): JSX.Element => {


	return (
		<div>
			<h3>Connexion</h3>
			<Input
				label="e-mail"
				name="username"
				value={view.store.username}
				onInputChange={(username) => view.update({username})}
			/>
			<Input
				label="mot de passe"
				name="password"
				value={view.store.password}
				onInputChange={(password) => view.update({password})}
			/>
			<Button
				name="connexion"
				onClick={() => {
					view.session.login(view.store.username, view.store.password)
						.then(() => {
							view.router.navigate("")
						})
						.catch(() => {})
				}}
			/>
			<Link
				href="Inscription"

			>
				Inscription
			</Link>
		</div>
	);
};

export default Main