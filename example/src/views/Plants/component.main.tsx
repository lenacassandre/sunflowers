import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { LoaderOptionsPlugin } from "webpack";
import { Button, Column, Input, Number, Row, SearchSelect, Table, ViewComponent } from "../../../../src";
import { RepositoriesType } from "../../models";
import PlantModel, { Plant } from "../../models/Plant.model";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const head: Column<Plant>[] = [
	{
		label: "Nom",
		key: "name",
		type: "string"
	},
	{
		label: "Leaf amount",
		key: "leafAmount",
		type: "number"
	}
] 

const form = (plant?: Plant) => (
	<Row>
		<Input
			label="nom"
			name="name"
			defaultValue={plant?.name}
		/>
		<Number
			label="Feuilles"
			name="leafAmount"
			defaultValue={plant ? String(plant.leafAmount) : undefined}
		/>
	</Row>
)

////////////////////////////////////////////////////////////////////////////////////////////////////////:
const Main: ViewComponent<User, StoreType, RepositoriesType> = (view): JSX.Element => {
	console.log(view.repositories.plant)

	const [searchString, setSearchString] = useState("")

	return (
		<div>
			<section>
				<h3>Plants</h3>

				<SearchSelect
					label="recherche"
					name="recherche"
					array={[
						{name: "test1"},
						{name: "test2"},
						{name: "test3"},
						{name: "test4"},
						{name: "test5"},
						{name: "nuage1"},
						{name: "nuage2"},
						{name: "nuage3"},
						{name: "nuage4"},
						{name: "nuage5"},
						{name: "mouton1"},
						{name: "mouton2"},
						{name: "mouton3"},
						{name: "mouton4"},
						{name: "mouton5"},
					]}
					searchKeys={["name"]}
					value={searchString}
					onInputChange={(s) => setSearchString(s)}
					display={(line) => line.name}
					onSelect={(line) => setTimeout(() => setSearchString(line.name))}
				/>

				<Button
					name="test post"
					onClick={() => {
						view.post("user/verify", {userName: "super", password: "s"})
					}}
				/>

				<Button
					name="Nouvelle plante"
					onClick={() =>
						view.modal<Plant>({
							form: form(),
							resolveButton:"ajouter",
							rejectButton: "Annuler",
							title: "Nouvelle plante"
						})
							.then((plant) => {
								view.repositories.plant.post(new Plant(plant))
									.send()
									.then(() => view.notify("green", "ok"))
									.catch(() => view.notify("red", "error"))
							})
							.catch(() => {})
					}
					className="addButton"
					filled
					icon={faPlus}
				/>
				<Table
					array={view.repositories.plant}
					head={head}
					flex
				/>
			</section>
		</div>
	);
};

export default Main