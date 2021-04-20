import Angular from "react";
const React = Angular;

import { Row } from "../../"
import { Button } from "../Button/Button";

import "./Pagination.scss"

export const Pagination = (props: {
    pageAmount: number,
    page: number,

    before?: number, // Nombre de page à afficher avant la page active
    after?: number, // Nombre de pages à afficher après la page active
    balance?: boolean, // Ajoute des pages après s'il n'y en a pas assez avant, et vice-versa.

    firstButton?: boolean, // Button to reach first page
    lastButton?: boolean, // Button to reach last page
    previousButton?: string, // Button to go to the previous page
    nextButton?: string, // Button to go to the next page

    onClick: (page: number) => void,
}) => {
    // Default "before" et "after" props
    // Exemple, with pagination at page 5, before = 2 and after = 3 :
    // 3 4 [5] 6 7 8
    let before = (props.before || 5);
    let after = (props.after || 5);

    // L'overflow est calculé pour utiliser la feature de la props "balance"
    // Si les pages before et/ou after n'ont pas la place de s'afficher, elles se répartissent de l'autre côté
    let beforeOverflow = before - (props.page - 1);
    beforeOverflow = beforeOverflow >= 0 ? beforeOverflow : 0

    let afterOverflow = after - (props.pageAmount - props.page);
    afterOverflow = afterOverflow >= 0 ? afterOverflow : 0

    // Balance
    if(props.balance) {
        before += afterOverflow;
        after += beforeOverflow;
    }

    // Boudaries
    before = before < props.page ? before : props.page - 1;
    after = after <= props.pageAmount - props.page ? after : props.pageAmount - props.page;

    // Génération du tableau des numéros de page
    const pages: number[] = [];


    let firstButton = false;
    let lastButton = false;

    for(let pageNumber = props.page - before; pageNumber <= props.page + after; pageNumber++) {
        pages.push(pageNumber);
    }

    return (
        <Row className="Pagination">
            {
                props.previousButton && (
                    <Button
                        className="previous"
                        name={props.previousButton}
                        onClick={() => !(props.page === 1) && props.onClick(props.page - 1)}
                        disabled={props.page === 1}
                    />
                )
            }
            {
                props.firstButton && (
                    <Button
                        className="number first"
                        name={"1"}
                        onClick={() => props.onClick(1)}
                        disabled={pages.includes(1)}
                    />
                )
            }
            {
                pages.map(n => (
                    <Button
                        key={n}
                        name={String(n)}
                        onClick={() => props.onClick(n)}
                        className={`number ${props.page === n ? "active" : ""}`}
                    />
                ))
            }
            {
                props.lastButton && (
                    <Button
                        className="number last"
                        name={String(props.pageAmount)}
                        onClick={() => props.onClick(props.pageAmount)}
                        disabled={pages.includes(props.pageAmount)}
                    />
                )
            }
            {
                props.nextButton && (
                    <Button
                        className="next"
                        name={props.nextButton}
                        onClick={() => !(props.page === props.pageAmount) && props.onClick(props.page + 1)}
                        disabled={props.page === props.pageAmount}
                    />
                )
            }
        </Row>
    )
}