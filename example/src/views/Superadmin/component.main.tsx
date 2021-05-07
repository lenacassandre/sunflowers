import { faArchive, faBoxOpen, faBurn, faPlus, faTrash, faTrashRestore } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Button, Column, Input, Row, Select, Table, TabsPages, ViewComponent } from "../../../../src";
import { RepositoriesType } from "../../models";
import { Organization } from "../../models/Organization.model";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const orgaHead: Column<Organization>[] = [
	{
		label: "nom",
		key: "name",
		type: "string",
	}
]

const orgaForm = (orga?: Organization) => (
	<>
		<Input
			label="nom"
			name="name"
			value={orga?.name}
		/>
	</>
)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Main: ViewComponent<User, StoreType, RepositoriesType> = (view): JSX.Element => {
	console.log("ORGA",view.repositories.organization)

	// ORGANISATION HEADS
	const orgaMainHead: Column<Organization>[] = [
		...orgaHead,
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="actionButton"
					filled
					icon={faArchive}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Archiver une organisation",
							message: `Souhaitez vous archiver l'organisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Archiver"
						})
							.then(() => {
								console.log("ARCHIVE ORGA", orga)
								orga.archive()
									.send()
									.then(() => view.notify("Organisation archivée."))
									.catch(() => view.notify("Erreur", "red"))
							})
					}}
				/>
			)
		},
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="removeButton"
					filled
					icon={faTrash}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Supprimer une organisation",
							message: `Souhaitez vous supprimer l'oragnisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Supprimer"
						})
							.then(() => {
								orga.remove()
									.send()
									.then(() => view.notify("Organisation supprimée."))
									.catch(() => view.notify("Erreur", "red"))
							})
							.catch(() => {})
					}}
				/>
			)
		}
	]

	const orgaArchivesHead: Column<Organization>[] = [
		...orgaHead,
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="actionButton"
					filled
					icon={faBoxOpen}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Désarchiver une organisation",
							message: `Souhaitez vous désarchiver l'oragnisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Désarchiver"
						})
							.then(() => {
								console.log("UNARCHIVE ORGA", orga)
								orga.unarchive()
									.send()
									.then(() => view.notify("Organisation désarchivée."))
									.catch(() => view.notify("Erreur", "red"))
							})
							.catch(() => {})
					}}
				/>
			)
		},
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="removeButton"
					filled
					icon={faTrash}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Supprimer une organisation",
							message: `Souhaitez vous supprimer l'oragnisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Supprimer"
						})
							.then(() => {
								orga.remove()
									.send()
									.then(() => view.notify("Organisation supprimée."))
									.catch(() => view.notify("Erreur", "red"))
							})
							.catch(() => {})
					}}
				/>
			)
		}
	]

	const orgaRemovedHead: Column<Organization>[] = [
		...orgaHead,
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="actionButton"
					filled
					icon={faTrashRestore}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Restaurer une organisation",
							message: `Souhaitez vous restaurer l'oragnisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Restaurer"
						})
							.then(() => {
								console.log("UNARCHIVE ORGA", orga)
								orga.restore()
									.send()
									.then(() => view.notify("Organisation restaurée."))
									.catch(() => view.notify("Erreur", "red"))
							})
							.catch(() => {})
					}}
				/>
			)
		},
		{
			label: "",
			type: 'function',
			key: "",
			size: 4,
			function: (orga) => (
				<Button
					className="removeButton"
					filled
					icon={faBurn}
					onClick={(event) => {
						event.stopPropagation();

						view.modal({
							title: "Supprimer définitivement une organisation",
							message: `Souhaitez vous supprimer définitivement l'oragnisation ${orga.name} ?`,
							rejectButton: "Annuler",
							resolveButton: "Supprimer définitivement"
						})
							.then(() => {
								orga.destroy()
									.send()
									.then(() => view.notify("Organisation définitivement supprimée."))
									.catch(() => view.notify("Erreur", "red"))
							})
							.catch(() => {})
					}}
				/>
			)
		}
	]

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	const userHead: Column<User>[] = [
		{
			label: "userName",
			key: "userName",
			type: "string",
		},
		{
			label: "prénom",
			key: "firstName",
			type: "string",
		},
		{
			label: "nom",
			key: "lastName",
			type: "string",
		},
		{
			label: "rôles",
			key: "roles",
			type: "function",
			function: (user) => user.roles.reduce((string, role, i, a) => `${string}${role}${i < a.length -1 ? ", " : ""}`, "")
		},
		{
			label: "organisations",
			key: "organization",
			type: "function",
			function: (user) => user.organizations.reduce((string, orgaId, i, a) => {
				const orga = view.repositories.organization.findById(orgaId);

				if(!orga) return string

				return `${string}${orga.name}${i < a.length -1 ? ", " : ""}
			`}, "")
		},
	]

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	const userForm = (user?: User) => (
		<>
			<Input
				label="username"
				name="userName"
				value={user?.userName}
			/>

			<Row flex>
				<Input
					label="prénom"
					name="firstName"
					value={user?.firstName}
				/>
				<Input
					label="nom"
					name="lastName"
					value={user?.lastName}
				/>
			</Row>

			<Row flex>
				<Select
					values={[1, 2, 3]}
					labels={["SuperAdmin", "Jardinier", "Canard"]}
					label="roles"
					name="roles"
					value={user?.roles}
					multiple
				/>
				<Select
					values={view.repositories.organization.getIdsMap()}
					labels={view.repositories.organization.map(orga => orga.name)}
					label="Organisations"
					name="organizations"
					value={user?.organizations}
					multiple
				/>
			</Row>
		</>
	)

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	return (
		<TabsPages
			active={view.store.page}
		>
			<>
				{/**REPO */}
				<section>
					<Button
						name="Nouvelle organisation"
						className="addButton"
						icon={faPlus}
						onClick={() => {
							view.modal<Organization>({
								title: "Nouvelle organisation",
								rejectButton: "Annuler",
								resolveButton: "Ajouter",
								form: orgaForm()
							})
								.then((orga) => {
									view.repositories.organization.post(new Organization(orga))
										.send()
										.then(() => {
											view.notify("Ok", "green")
										})
										.catch((e) => view.notify("erreur", "red"))
								})
								.catch(() => {})
						}}
					/>
					<Table<Organization>
						array={view.repositories.organization}
						head={orgaMainHead}
						flex
						onClick={(orga) => {
							view.modal<Organization>({
								title: "Modifier l'organisation",
								rejectButton: "Annuler",
								resolveButton: "Modifier",
								form: orgaForm(orga)
							})
								.then((patch) => {
									orga.patch(patch)
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
				</section>

				{/**ARCHIVES */}
				<section>
					<Button
						name="Demander les archives des organisations"
						className="addButton"
						icon={faArchive}
						onClick={() => view.repositories.organization.getArchives()
							.send()
							.then(() => view.notify("Archives reçues.", "green"))
							.catch(() => view.notify("Erreur.", "red"))
						}
					/>
					<Table<Organization>
						array={view.repositories.organization.archives}
						head={orgaArchivesHead}
						flex
					/>
				</section>

				{/**REMOVED */}
				<section>
					<Button
						name="Demander les oragnisations supprimées"
						className="addButton"
						icon={faTrash}
						onClick={() => view.repositories.organization.getRemoved()
							.send()
							.then(() => view.notify("Corbeille reçue.", "green"))
							.catch(() => view.notify("Erreur.", "red"))
						}
					/>
					<Table<Organization>
						array={view.repositories.organization.removed}
						head={orgaRemovedHead}
						flex
					/>
				</section>
			</>


			<>
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				{/***************************************************************************************************** */}
				<section>
					<Button
						name="Nouvel utilisateur"
						className="addButton"
						icon={faPlus}
						onClick={() => {
							view.modal<User>({
								title: "Nouvel utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Ajouter",
								form: userForm()
							})
								.then((user) => {
									view.repositories.user.post(new User(user))
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
					<Table<User>
						array={view.repositories.user}
						head={userHead}
						flex
						onClick={(user) => {
							view.modal<User>({
								title: "Modifier l'utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Modifier",
								form: userForm(user)
							})
								.then((patch) => {
									user.patch(patch)
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
				</section>

				{/**ARCHIVES */}
				<section>
					<Button
						name="Nouvel utilisateur"
						className="addButton"
						icon={faPlus}
						onClick={() => {
							view.modal<User>({
								title: "Nouvel utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Ajouter",
								form: userForm()
							})
								.then((user) => {
									view.repositories.user.post(new User(user))
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
					<Table<User>
						array={view.repositories.user}
						head={userHead}
						flex
						onClick={(user) => {
							view.modal<User>({
								title: "Modifier l'utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Modifier",
								form: userForm(user)
							})
								.then((patch) => {
									user.patch(patch)
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
				</section>

				{/**REMOVED */}
				<section>
					<Button
						name="Nouvel utilisateur"
						className="addButton"
						icon={faPlus}
						onClick={() => {
							view.modal<User>({
								title: "Nouvel utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Ajouter",
								form: userForm()
							})
								.then((user) => {
									view.repositories.user.post(new User(user))
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
					<Table<User>
						array={view.repositories.user}
						head={userHead}
						flex
						onClick={(user) => {
							view.modal<User>({
								title: "Modifier l'utilisateur",
								rejectButton: "Annuler",
								resolveButton: "Modifier",
								form: userForm(user)
							})
								.then((patch) => {
									user.patch(patch)
										.send()
										.then(() => {
											view.notify("green", "Ok")
										})
										.catch((e) => view.notify("red", "erreur"))
								})
								.catch(() => {})
						}}
					/>
				</section>
			</>
		</TabsPages>
	);
};

export default Main