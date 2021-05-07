import React from "react";
import {Link} from '../../../../src'
import views from '../../views'
import {User} from "../../models/User.model"
import './NavigationMenu.scss'

export const NavigationMenu: React.FC<{
    user: User | null
    currentPath: string
}> = (props) => {
	return (
        <ul className="NavigationMenu">
            {
                props.user && views
                    .filter(view =>
                        view.menu
                        && (
                            !view.roles
                            || view.roles.length === 0
                            || view.roles.some(role => props.user?.roles.includes(role))
                        )
                    ).map((view, i) => (
                        <Link
                            key={i}
                            className={
                                Array.isArray(view.path)
                                    ? view.path.includes(props.currentPath)
                                        ? "active"
                                        : ""
                                    : view.path === props.currentPath
                                        ? "active"
                                        : ""
                            }
                            href={typeof view.path === "string" ? view.path : view.path[0]}
                        >
                            <span>{view.title}</span>
                        </Link>
                    ))
            }
        </ul>
	);
};
