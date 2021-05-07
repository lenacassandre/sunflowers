import React from "react";
import { Button, Input, Link, Row, Select, ViewComponent } from "../../../../src";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const Main: ViewComponent<User, StoreType> = (view): JSX.Element => {
	return (
		<div>
			<h3>Inscription</h3>

			<Row>
				<Input
					label="e-mail"
					name="username"
					value={view.store.userName}
					onInputChange={(userName) => view.update({userName})}
				/>
				<Select
					values={[1, 2, 3]}
					labels={["SuperAdmin", "Jardinier", "Canard"]}
					label="roles"
					name="roles"
					value={view.store.roles}
					onChange={(roles) => view.update({roles})}
					multiple
				/>
			</Row>

			<Row>
				<Input
					label="prénom"
					name="firstname"
					value={view.store.firstName}
					onInputChange={(firstName) => view.update({firstName})}
				/>
				<Input
					label="nom"
					name="lastname"
					value={view.store.lastName}
					onInputChange={(lastName) => view.update({lastName})}
				/>
			</Row>

			<Row>
				<Input
					label="mot de passe"
					name="password"
					value={view.store.password}
					onInputChange={(password) => view.update({password})}
				/>
				<Input
					label="confirmation mdp"
					name="cpassword"
					value={view.store.cpassword}
					onInputChange={(cpassword) => view.update({cpassword})}
				/>
			</Row>

			<Button
				name="Inscription"
				onClick={() => {
					const newUser = {
						userName: view.store.userName,
						firstName: view.store.firstName,
						lastName: view.store.lastName,
						roles: view.store.roles
					};

					view.emit<{_id: string, token: string}>(
						"user/signup",
						{
							user: newUser,
							password: view.store.password
						}
					)
						.then(response => {
							const responseUser = new User({
								...newUser,
								_id: response._id
							})

							view.session.saveSession(response.token, responseUser)
							// Post without sending it to the server.
							view.repositories.user.post(responseUser)
							view.notify("green", "inscription réussie")
						})
						.catch(() => view.notify("red", "erreur"))
				}}
				disabled={
					!view.store.userName
					|| !view.store.firstName
					|| !view.store.lastName
					|| view.store.roles.length === 0
					|| !view.store.password
					|| view.store.password !== view.store.cpassword
				}
			/>
			<Link
				href="Connexion"

			>
				Connexion
			</Link>
		</div>
	);
};

export default Main