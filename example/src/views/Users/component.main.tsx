import React from "react";
import { Button, Column, Input, Row, Select, Table, ViewComponent } from "../../../../src";
import { RepositoriesType } from "../../models";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const head: Column<User>[] = [
	{
		key: "userName",
		label: "E-mail"
	},
	{
		key: "firstName",
		label: "Prénom"
	},
	{
		key: "lastName",
		label: "Nom"
	}
]

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const userForm = (user?: User) => (
	<div>
		<Row flex>
			<Input
				label="E-mail"
				name="userName"
				defaultValue={user?.userName}
				required
			/>
			<Select
				values={[1, 2, 3]}
				labels={["SuperAdmin", "Jardinier", "Canard"]}
				name="roles"
				label="Rôles"
				value={user?.roles}
				required
			/>
		</Row>
		<Row flex>
			<Input
				label="Prénom"
				name="firstName"
				defaultValue={user?.firstName}
				required
			/>
			<Input
				label="Nom"
				name="lastName"
				defaultValue={user?.lastName}
				required
			/>
		</Row>
	</div>
)

////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Main: ViewComponent<User, StoreType, RepositoriesType> = (view): JSX.Element => {
	console.log("CONSOLE.LOG", view.repositories.user)

	return (
		<div>
			<section>
				<h3>Utilisateurs</h3>
				<Button
					name="nouvel utilisateur"
					className="addButton"
					onClick={() => {
						view.modal<User>({
							title: "Nouvel utilisateur",
							form: userForm(),
							rejectButton: "Annuler",
							resolveButton: "Ajouter"
						})
							.then((user) => {
								view.repositories.user.post(new User(user))
							})
							.catch(() => {})
					}}
				/>
				<Table<User>
					array={view.repositories.user}
					head={head}
					flex
					onClick={() => {

					}}
				/>
			</section>

			{/***************************************************************************************/}
			<section>
				<h3>Utilisateurs archivés</h3>
				<Button
					name="get archives"
					className="addButton"
					onClick={view.repositories.user.getArchives}
				/>
				<Table<User>
					array={view.repositories.user.archives}
					head={head}
					flex
				/>
			</section>

			{/***************************************************************************************/}
			<section>
				<h3>Utilisateurs</h3>
				<Button
					name="get removed"
					className="addButton"
					onClick={view.repositories.user.getRemoved}
				/>
				<Table<User>
					array={view.repositories.user.removed}
					head={head}
					flex
				/>
			</section>
		</div>
	);
};

export default Main