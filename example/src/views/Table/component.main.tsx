import React from "react";
import { Column, Pagination, Table, ViewComponent } from "../../../../src";
import {User} from '../../models/User.model';
import { StoreType } from './script.store';
import "./style.scss";

const head: Column[] = [
    {
        label: "Nom",
        key: "lastName"
    },
    {
        label: "Prénom",
        key: "firstName"
    }
]

const array: {firstName: string, lastName: string}[] = []

for(let i = 1; i <= 1000; i++) {
    array.push({
        lastName: i.toString(),
        firstName: i.toString()
    })
}

const Main: ViewComponent<User, StoreType> = (view): JSX.Element => {
	return (
		<div>
            <h1>Sunflowers</h1>

            <section>
                <Pagination
                    page={view.store.page}
                    pageAmount={Math.ceil(array.length / view.store.rowPerPage)}
                    onClick={(page) => view.update({page})}
                    previousButton="Précédent"
                    nextButton="Suivant"
                    firstButton
                    lastButton
                    balance
                    before={2}
                    after={3}
                />
                <Table
                    flex
                    head={head}
                    array={array}
                    page={view.store.page}
                    rowPerPage={view.store.rowPerPage}
                />
                <Pagination
                    page={view.store.page}
                    pageAmount={Math.ceil(array.length / view.store.rowPerPage)}
                    onClick={(page) => view.update({page})}
                    previousButton="Précédent"
                    nextButton="Suivant"
                    firstButton
                    lastButton
                    balance
                    before={2}
                    after={3}
                />
            </section>
        </div>
	);
};

export default Main